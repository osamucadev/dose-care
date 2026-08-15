import { useCallback } from 'react';

import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';
import * as doseService from '@/services/dose-service';

import { withAlwaysRefresh } from './dose-action-runner';
import { useAsyncData } from './use-async-data';

/**
 * Today's dose occurrences plus a short lookahead (see
 * `services/dose-service.ts`). Pass a profileId to scope to one profile
 * (Profile screen), or omit it for the aggregated Home view.
 */
export function useDoses(profileId?: string) {
  const { data, loading, error, refresh } = useAsyncData(
    () => doseService.getUpcomingOccurrences(profileId),
    [profileId]
  );

  const recordDose = useCallback(
    (occurrence: DoseOccurrence, status: DoseEventStatus) =>
      // `withAlwaysRefresh` refreshes whether the write succeeds, fails
      // with DoseAlreadyResolvedError, or fails for any other reason —
      // the on-screen occurrences should reflect whatever ended up
      // persisted. The original error (if any) still propagates to the
      // caller (`useDoseActionHandler`) after the refresh is kicked off.
      //
      // Note: awaiting the resulting promise only means the fetch has
      // completed and a state update has been queued — not that React
      // has re-rendered yet (see `useAsyncData`). Preventing a
      // duplicate write for the same occurrence is the job of the
      // synchronous lock in `useDoseActionHandler`, not this await.
      withAlwaysRefresh(() => doseService.recordDoseAction(occurrence, status), refresh),
    [refresh]
  );

  return { occurrences: data ?? [], loading, error, refresh, recordDose };
}
