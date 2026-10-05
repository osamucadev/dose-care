import * as doseService from '@/services/dose-service';

import { usePendingDoseAction } from './pending-dose-action-provider';
import { useAsyncData } from './use-async-data';

export function useHistory(profileId: string | undefined) {
  // Reload after every Tomado/Pular write, which may land while this
  // screen is open (the undo window ends after navigating here).
  const { writeVersion } = usePendingDoseAction();
  const { data, loading, error, refresh } = useAsyncData(
    () => (profileId ? doseService.getHistoryForProfile(profileId) : Promise.resolve([])),
    [profileId, writeVersion]
  );

  return { events: data ?? [], loading, error, refresh };
}
