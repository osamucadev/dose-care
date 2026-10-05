import { useCallback } from 'react';

import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';

import { usePendingDoseAction } from './pending-dose-action-provider';

/**
 * "Tomado"/"Pular" for the Home and Profile screens. The action starts
 * the undo window instead of writing right away (see
 * `PendingDoseActionQueue`): the dose leaves "Agora" at once and is only
 * recorded when the window ends, another dose is recorded or the app
 * leaves the foreground. A failed write surfaces as `hasActionError`.
 */
export function useDoseActionHandler() {
  const { schedule, hasWriteError, dismissWriteError } = usePendingDoseAction();

  const performDoseAction = useCallback(
    (occurrence: DoseOccurrence, status: DoseEventStatus) => schedule({ occurrence, status }),
    [schedule]
  );

  return { performDoseAction, hasActionError: hasWriteError, clearActionError: dismissWriteError };
}
