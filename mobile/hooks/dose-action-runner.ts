import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';

import { DoseActionLock } from './dose-action-lock';

export type RecordDose = (occurrence: DoseOccurrence, status: DoseEventStatus) => Promise<void>;

export interface DoseActionOutcome {
  /** False when the call was ignored because this occurrence was already in flight — `recordDose` was never invoked. */
  started: boolean;
  /** Set when `recordDose` ran and rejected. Absent on success or when `started` is false. */
  error?: unknown;
}

/**
 * The framework-free core of `useDoseActionHandler`: runs `recordDose`
 * for `occurrence`, guarded by `lock` so a second call for the same
 * occurrence made before the first one finishes is ignored — without
 * calling `recordDose` (and therefore never reaching the database) a
 * second time. `lock.acquire` happens synchronously, before the first
 * `await`, and `lock.release` always runs in `finally`.
 *
 * Pulled out of the React hook so this exact sequencing can be unit
 * tested directly, without rendering a component.
 */
export async function runDoseAction(
  lock: DoseActionLock,
  recordDose: RecordDose,
  occurrence: DoseOccurrence,
  status: DoseEventStatus
): Promise<DoseActionOutcome> {
  if (lock.isLocked(occurrence.id)) {
    return { started: false };
  }
  lock.acquire(occurrence.id);
  try {
    await recordDose(occurrence, status);
    return { started: true };
  } catch (error) {
    return { started: true, error };
  } finally {
    lock.release(occurrence.id);
  }
}

/**
 * Runs `action`, then always runs `refresh` — whether `action` resolved
 * or rejected — and re-throws `action`'s error (if any) afterwards.
 * Used by `useDoses.recordDose` so a duplicate registration
 * (DoseAlreadyResolvedError) still brings the on-screen occurrences
 * back in line with what is actually persisted, instead of leaving
 * stale data on screen just because the write failed. `refresh` itself
 * is expected to never reject (see `useAsyncData`), so this never
 * swallows or replaces `action`'s error with a refresh error.
 */
export async function withAlwaysRefresh<T>(action: () => Promise<T>, refresh: () => Promise<void>): Promise<T> {
  try {
    return await action();
  } finally {
    await refresh();
  }
}
