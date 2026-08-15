import { useCallback } from 'react';

import type { CreateProfileInput, UpdateProfileInput } from '@/database/repositories';
import * as profileService from '@/services/profile-service';

import { useAsyncData } from './use-async-data';

export function useProfiles() {
  const { data, loading, error, refresh } = useAsyncData(() => profileService.listProfiles(), []);

  const createProfile = useCallback(
    async (input: CreateProfileInput) => {
      const profile = await profileService.createProfile(input);
      refresh();
      return profile;
    },
    [refresh]
  );

  const updateProfile = useCallback(
    async (id: string, input: UpdateProfileInput) => {
      await profileService.updateProfile(id, input);
      refresh();
    },
    [refresh]
  );

  return { profiles: data ?? [], loading, error, refresh, createProfile, updateProfile };
}
