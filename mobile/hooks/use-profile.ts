import * as profileService from '@/services/profile-service';

import { useAsyncData } from './use-async-data';

/** A single profile by id — used by the profile/edit screens. */
export function useProfile(id: string | undefined) {
  const { data, loading, error, refresh } = useAsyncData(
    () => (id ? profileService.getProfile(id) : Promise.resolve(null)),
    [id]
  );

  return { profile: data, loading, error, refresh };
}
