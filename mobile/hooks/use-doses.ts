import { useCallback } from 'react';

import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';
import * as doseService from '@/services/dose-service';

import { useAsyncData } from './use-async-data';

/**
 * Today's dose occurrences. Pass a profileId to scope to one profile
 * (Profile screen), or omit it for the aggregated Home view.
 */
export function useDoses(profileId?: string) {
  const { data, loading, error, refresh } = useAsyncData(
    () => doseService.getTodayOccurrences(profileId),
    [profileId]
  );

  const recordDose = useCallback(
    async (occurrence: DoseOccurrence, status: DoseEventStatus) => {
      await doseService.recordDoseAction(occurrence, status);
      refresh();
    },
    [refresh]
  );

  return { occurrences: data ?? [], loading, error, refresh, recordDose };
}
