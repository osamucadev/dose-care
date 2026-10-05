import { useMemo } from 'react';

import * as doseService from '@/services/dose-service';

import { applyDoseActionOverlay } from './pending-dose-action';
import { usePendingDoseAction } from './pending-dose-action-provider';
import { useAsyncData } from './use-async-data';

/**
 * Today's dose occurrences plus a short lookahead (see
 * `services/dose-service.ts`). Pass a profileId to scope to one profile
 * (Profile screen), or omit it for the aggregated Home view.
 *
 * Tomado/Pular are not written here: they go through the undo window in
 * `PendingDoseActionProvider`. This hook shows them as done right away
 * (the overlay) and reloads after every write, whichever screen made it.
 */
export function useDoses(profileId?: string) {
  const { overlay, writeVersion } = usePendingDoseAction();
  const { data, loading, error, refresh } = useAsyncData(
    () => doseService.getUpcomingOccurrences(profileId),
    [profileId, writeVersion]
  );

  const occurrences = useMemo(() => applyDoseActionOverlay(data ?? [], overlay), [data, overlay]);

  return { occurrences, loading, error, refresh };
}
