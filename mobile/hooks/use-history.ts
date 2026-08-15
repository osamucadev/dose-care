import * as doseService from '@/services/dose-service';

import { useAsyncData } from './use-async-data';

export function useHistory(profileId: string | undefined) {
  const { data, loading, error, refresh } = useAsyncData(
    () => (profileId ? doseService.getHistoryForProfile(profileId) : Promise.resolve([])),
    [profileId]
  );

  return { events: data ?? [], loading, error, refresh };
}
