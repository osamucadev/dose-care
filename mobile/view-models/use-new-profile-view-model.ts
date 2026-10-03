import { useRouter } from 'expo-router';
import { useState } from 'react';

import type { ProfileFormValues } from '@/features/profiles/profile-schema';
import * as profileService from '@/services/profile-service';

export interface NewProfileViewModel {
  hasSubmitError: boolean;
  dismissSubmitError: () => void;
  submit: (values: ProfileFormValues) => Promise<void>;
}

export function useNewProfileViewModel(): NewProfileViewModel {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<Error | null>(null);

  return {
    hasSubmitError: submitError !== null,
    dismissSubmitError: () => setSubmitError(null),
    submit: async (values) => {
      try {
        const profile = await profileService.createProfile({ ...values, notes: values.notes || null });
        router.replace(`/profile/${profile.id}`);
      } catch (err) {
        setSubmitError(err instanceof Error ? err : new Error(String(err)));
      }
    },
  };
}
