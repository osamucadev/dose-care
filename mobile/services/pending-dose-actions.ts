import type { DoseEventRepository } from '@/database/repositories/dose-event-repository';
import { DoseAlreadyResolvedError } from '@/database/repositories/dose-event-repository';
import type { PendingDoseActionRepository } from '@/database/repositories/pending-dose-action-repository';
import { createDoseEventFromOccurrence } from '@/domain/dose-events';
import type { StoredPendingDoseAction } from '@/domain/validation';

export interface PendingActionStores {
  pendingDoseActions: PendingDoseActionRepository;
  doseEvents: DoseEventRepository;
}

export type CommitResult = 'written' | 'already-resolved';

/**
 * Turns a waiting Tomado/Pular into its DoseEvent, then drops it from
 * pending_dose_actions. The event's occurredAt is the moment of the tap,
 * not of the commit, so a leftover committed hours later still records
 * when the dose was actually taken.
 *
 * Safe to repeat: if the app dies between the two writes, the next run
 * finds the event already there (UNIQUE per occurrence), treats it as
 * done and just removes the pending row.
 */
export async function commitStoredAction(
  stores: PendingActionStores,
  action: StoredPendingDoseAction,
  newId: () => string
): Promise<CommitResult> {
  const event = createDoseEventFromOccurrence(
    { ...action.occurrence, status: 'pending', event: null, allowEarly: false },
    action.status,
    { id: newId(), occurredAt: action.occurredAt }
  );

  let result: CommitResult = 'written';
  try {
    await stores.doseEvents.create(event);
  } catch (error) {
    if (!(error instanceof DoseAlreadyResolvedError)) throw error;
    result = 'already-resolved';
  }
  await stores.pendingDoseActions.remove(action.occurrence.id);
  return result;
}

/**
 * Commits whatever was still waiting when the app was last closed or
 * killed: the user never undid it, so it stands. Corrupted rows are
 * dropped rather than blocking every later launch. Returns how many
 * DoseEvents were written.
 */
export async function commitLeftovers(stores: PendingActionStores, newId: () => string): Promise<number> {
  let written = 0;
  for (const row of await stores.pendingDoseActions.listAll()) {
    if (!row.action) {
      await stores.pendingDoseActions.remove(row.occurrenceId);
      continue;
    }
    if ((await commitStoredAction(stores, row.action, newId)) === 'written') written += 1;
  }
  return written;
}
