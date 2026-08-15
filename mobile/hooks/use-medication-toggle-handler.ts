import { useCallback, useRef, useState } from 'react';

import { DoseActionLock } from './dose-action-lock';
import { runLockedAction, runThenRefreshOnSuccess } from './dose-action-runner';

type SetMedicationActive = (id: string, active: boolean) => Promise<void>;
type RefreshDoses = () => Promise<void>;

/**
 * Centralizes "activate/deactivate" for a medication on the Profile
 * screen:
 *
 * - A synchronous per-medication lock (reusing the same
 *   `DoseActionLock`/`runLockedAction` mechanism as dose actions, via
 *   `runLockedAction`) so a second tap on the same medication before
 *   the first toggle finishes is ignored.
 * - On success, dose occurrences are refreshed too (see
 *   `runThenRefreshOnSuccess`) before the action is considered
 *   complete, so a deactivated medication's pending doses disappear
 *   from Agora/Próximo/upcoming/the Home summary immediately — no
 *   failed toggle ever triggers a pointless extra fetch, since nothing
 *   changed in that case.
 * - Any failure is exposed via `toggleError` for a gentle, retryable
 *   message; the medication itself is never removed from the list —
 *   only its `active` flag (already reflected by the repository read)
 *   changes once the write actually succeeds.
 */
export function useMedicationToggleHandler(setActive: SetMedicationActive, refreshDoses: RefreshDoses) {
  const [togglingMedicationId, setTogglingMedicationId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<Error | null>(null);
  const lockRef = useRef<DoseActionLock | null>(null);
  if (!lockRef.current) lockRef.current = new DoseActionLock();

  const performToggle = useCallback(
    async (id: string, active: boolean) => {
      const lock = lockRef.current!;
      if (lock.isLocked(id)) {
        // Already being processed — ignore synchronously, no state
        // change, no call to setActive/the database.
        return;
      }

      setTogglingMedicationId(id);
      setToggleError(null);

      const outcome = await runLockedAction(lock, id, () =>
        runThenRefreshOnSuccess(() => setActive(id, active), refreshDoses)
      );

      setTogglingMedicationId(null);
      if (outcome.error) {
        setToggleError(outcome.error instanceof Error ? outcome.error : new Error(String(outcome.error)));
      }
    },
    [setActive, refreshDoses]
  );

  const clearToggleError = useCallback(() => setToggleError(null), []);

  return { togglingMedicationId, toggleError, performToggle, clearToggleError };
}
