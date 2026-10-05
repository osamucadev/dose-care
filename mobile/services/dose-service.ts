import * as Crypto from 'expo-crypto';

import { getRepositories } from '@/database/repositories';
import { addDaysToLocalDateString, nowUtcIso, toLocalDateString } from '@/domain/datetime';
import { buildHistoryEntries, type HistoryEntry } from '@/domain/history';
import { generateOccurrencesForDateRange } from '@/domain/occurrences';
import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';
import type { StoredPendingDoseAction } from '@/domain/validation';

import { commitLeftovers, commitStoredAction, type CommitResult } from './pending-dose-actions';
import { syncRemindersInBackground } from './reminder-service';

/**
 * Re-exported so callers (hooks, tests) can recognize a duplicate
 * registration with `instanceof` without reaching past the service
 * layer into `database/repositories` themselves — this error's
 * identity is meant to survive the trip from the repository up through
 * here unchanged, not be caught/wrapped/stringified along the way.
 */
export { DoseAlreadyResolvedError } from '@/database/repositories';

/** How far past today the Home/Profile screens are allowed to look for a "next" dose. */
const LOOKAHEAD_DAYS = 1;

/**
 * Expected doses for today plus a short lookahead window (currently
 * today + tomorrow), computed fresh from active medications plus
 * whatever events already exist in that window. The window is bounded
 * on purpose — see `generateOccurrencesForDateRange` — so this never
 * grows into generating occurrences indefinitely into the future.
 *
 * Pass a profileId to scope to a single profile, or omit it for the
 * aggregated "Todos" view.
 */
export async function getUpcomingOccurrences(profileId?: string): Promise<DoseOccurrence[]> {
  const { medications, doseEvents } = await getRepositories();
  const todayStr = toLocalDateString(new Date());
  const lastDayStr = addDaysToLocalDateString(todayStr, LOOKAHEAD_DAYS);

  const meds = profileId
    ? await medications.listByProfile(profileId)
    : await medications.listActiveForAllProfiles();

  const eventsByDay = await Promise.all(
    Array.from({ length: LOOKAHEAD_DAYS + 1 }, (_, offset) =>
      doseEvents.listForDate(addDaysToLocalDateString(todayStr, offset))
    )
  );

  return generateOccurrencesForDateRange(meds, todayStr, lastDayStr, eventsByDay.flat());
}

/**
 * Stores a Tomado/Pular the moment it is tapped, before its undo window
 * ends, so it survives the app being closed (see migration 006).
 */
export async function holdDoseAction(occurrence: DoseOccurrence, status: DoseEventStatus): Promise<StoredPendingDoseAction> {
  const { pendingDoseActions } = await getRepositories();
  const action: StoredPendingDoseAction = {
    occurrence: {
      id: occurrence.id,
      profileId: occurrence.profileId,
      medicationId: occurrence.medicationId,
      medicationName: occurrence.medicationName,
      dosage: occurrence.dosage,
      quantityPerDose: occurrence.quantityPerDose,
      scheduledAt: occurrence.scheduledAt,
    },
    status,
    occurredAt: nowUtcIso(),
  };
  await pendingDoseActions.save(action);
  return action;
}

/** "Desfazer": the waiting action is dropped and never becomes history. */
export async function releaseDoseAction(occurrenceId: string): Promise<void> {
  const { pendingDoseActions } = await getRepositories();
  await pendingDoseActions.remove(occurrenceId);
}

/** The undo window is over: write the DoseEvent and re-plan reminders. */
export async function commitDoseAction(action: StoredPendingDoseAction): Promise<CommitResult> {
  const repositories = await getRepositories();
  const result = await commitStoredAction(repositories, action, () => Crypto.randomUUID());
  // The recorded dose no longer needs its reminder.
  syncRemindersInBackground();
  return result;
}

/** On launch: commit what was still waiting when the app was last closed. */
export async function commitLeftoverDoseActions(): Promise<number> {
  const repositories = await getRepositories();
  const written = await commitLeftovers(repositories, () => Crypto.randomUUID());
  if (written > 0) syncRemindersInBackground();
  return written;
}

/**
 * A profile's history, most recent first, with each medication's current
 * name (see `buildHistoryEntries`). Inactive medications are included so
 * their past doses still resolve to a name.
 */
export async function getHistoryForProfile(profileId: string): Promise<HistoryEntry[]> {
  const { doseEvents, medications } = await getRepositories();
  const [events, meds] = await Promise.all([
    doseEvents.listByProfile(profileId),
    medications.listByProfile(profileId, { includeInactive: true }),
  ]);
  return buildHistoryEntries(events, meds);
}
