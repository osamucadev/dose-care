import { useCallback, useRef, useState } from 'react';

import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';
import { DoseAlreadyResolvedError } from '@/services/dose-service';

import { DoseActionLock } from './dose-action-lock';
import { runDoseAction, type RecordDose } from './dose-action-runner';

/**
 * Centralizes the "Tomado"/"Pular" action for both the Home and Profile
 * screens:
 *
 * - A synchronous per-occurrence lock (`DoseActionLock`, via
 *   `runDoseAction`) so two taps arriving before a re-render can't both
 *   start a write — the lock is checked and acquired before the first
 *   `await`, released in `finally`. This is what actually prevents a
 *   duplicate write; it does not depend on `refresh()` having already
 *   updated what's on screen.
 * - Gentle handling of `DoseAlreadyResolvedError`: never shown as a
 *   failure, `actionError` stays untouched so no error UI appears —
 *   `recordDose` already triggers a refresh regardless of outcome (see
 *   `useDoses`), so the occurrence's real, persisted state is what the
 *   screen ends up showing.
 * - Any other error is exposed via `actionError` for the screen's own
 *   error UI ("Não foi possível registrar essa dose agora.").
 */
export function useDoseActionHandler(recordDose: RecordDose) {
  const [actingOccurrenceId, setActingOccurrenceId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);
  const lockRef = useRef<DoseActionLock | null>(null);
  if (!lockRef.current) lockRef.current = new DoseActionLock();

  const performDoseAction = useCallback(
    async (occurrence: DoseOccurrence, status: DoseEventStatus) => {
      const lock = lockRef.current!;
      if (lock.isLocked(occurrence.id)) {
        // Already being processed — ignore synchronously, no state
        // change, no call to recordDose/the database.
        return;
      }

      setActingOccurrenceId(occurrence.id);
      setActionError(null);

      const outcome = await runDoseAction(lock, recordDose, occurrence, status);

      setActingOccurrenceId(null);
      if (outcome.error && !(outcome.error instanceof DoseAlreadyResolvedError)) {
        setActionError(outcome.error instanceof Error ? outcome.error : new Error(String(outcome.error)));
      }
    },
    [recordDose]
  );

  const clearActionError = useCallback(() => setActionError(null), []);

  return { actingOccurrenceId, actionError, performDoseAction, clearActionError };
}
