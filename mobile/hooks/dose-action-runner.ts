import { DoseActionLock } from './dose-action-lock';

export interface LockedActionOutcome {
  /** False when the call was ignored because `key` was already in flight — `action` was never invoked. */
  started: boolean;
  /** Set when `action` ran and rejected. Absent on success or when `started` is false. */
  error?: unknown;
}

/**
 * Generic synchronous-lock-guarded action runner: runs `action` for
 * `key`, guarded by `lock` so a second call for the same key made
 * before the first finishes is ignored — `action` is never invoked a
 * second time for that key while the first is still in flight.
 * `lock.acquire` happens before the first `await`, `lock.release`
 * always runs in `finally`. It backs medication activate/deactivate
 * (`useMedicationToggleHandler`); Tomado/Pular go through the undo
 * window in `pending-dose-action.ts` instead.
 *
 * Pulled out of any React hook so this exact sequencing can be unit
 * tested directly, without rendering a component.
 */
export async function runLockedAction(
  lock: DoseActionLock,
  key: string,
  action: () => Promise<void>
): Promise<LockedActionOutcome> {
  if (lock.isLocked(key)) {
    return { started: false };
  }
  lock.acquire(key);
  try {
    await action();
    return { started: true };
  } catch (error) {
    return { started: true, error };
  } finally {
    lock.release(key);
  }
}

/**
 * Runs `action`; only if it succeeds, also runs `refreshDoses` before
 * resolving. Unlike `withAlwaysRefresh`, a failed `action` does NOT
 * trigger `refreshDoses` — nothing changed, so there is nothing new to
 * reconcile. Used when activating/deactivating a medication: once the
 * toggle has actually succeeded, the dose occurrence queues (Agora,
 * Próximo, upcoming, the Home summary) must reflect it immediately —
 * an active medication's newly-inactive doses must stop appearing
 * without the screen being reopened.
 */
export async function runThenRefreshOnSuccess<T>(
  action: () => Promise<T>,
  refreshDoses: () => Promise<void>
): Promise<T> {
  const result = await action();
  await refreshDoses();
  return result;
}
