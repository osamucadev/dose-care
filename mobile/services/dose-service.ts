import * as Crypto from 'expo-crypto';

import { getRepositories } from '@/database/repositories';
import { addDaysToLocalDateString, nowUtcIso, toLocalDateString } from '@/domain/datetime';
import { createDoseEventFromOccurrence } from '@/domain/dose-events';
import { generateOccurrencesForDateRange } from '@/domain/occurrences';
import type { DoseEvent, DoseEventStatus, DoseOccurrence } from '@/domain/types';

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

export async function recordDoseAction(
  occurrence: DoseOccurrence,
  status: DoseEventStatus
): Promise<void> {
  const { doseEvents } = await getRepositories();
  const event = createDoseEventFromOccurrence(occurrence, status, {
    id: Crypto.randomUUID(),
    occurredAt: nowUtcIso(),
  });
  await doseEvents.create(event);
}

export async function getHistoryForProfile(profileId: string): Promise<DoseEvent[]> {
  const { doseEvents } = await getRepositories();
  return doseEvents.listByProfile(profileId);
}
