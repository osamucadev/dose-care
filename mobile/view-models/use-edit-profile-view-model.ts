import { useRouter } from 'expo-router';
import { useState } from 'react';

import type { ProfileFormValues } from '@/features/profiles/profile-schema';
import { useProfile } from '@/hooks/use-profile';
import * as profileService from '@/services/profile-service';

export type EditProfileViewModel =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'ready';
      name: string;
      defaultValues: ProfileFormValues;
      hasSubmitError: boolean;
      dismissSubmitError: () => void;
      submit: (values: ProfileFormValues) => Promise<void>;
      deleting: boolean;
      hasDeleteError: boolean;
      dismissDeleteError: () => void;
      /** Soft-deletes the profile; the screen asks for confirmation first. */
      deleteProfile: () => Promise<void>;
    };

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export function useEditProfileViewModel(id: string): EditProfileViewModel {
  const router = useRouter();
  const { profile, loading, error, refresh } = useProfile(id);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  if (loading) return { status: 'loading' };
  if (error || !profile) return { status: 'error', retry: refresh };

  return {
    status: 'ready',
    name: profile.name,
    defaultValues: {
      name: profile.name,
      type: profile.type,
      avatar: profile.avatar,
      color: profile.color,
      notes: profile.notes ?? '',
    },
    hasSubmitError: submitError !== null,
    dismissSubmitError: () => setSubmitError(null),
    submit: async (values) => {
      try {
        await profileService.updateProfile(profile.id, { ...values, notes: values.notes || null });
        router.back();
      } catch (err) {
        setSubmitError(toError(err));
      }
    },
    deleting,
    hasDeleteError: deleteError !== null,
    dismissDeleteError: () => setDeleteError(null),
    deleteProfile: async () => {
      if (deleting) return;
      setDeleting(true);
      setDeleteError(null);
      try {
        await profileService.deactivateProfile(profile.id);
        // Clears Profile + Edit off the stack so the back button can't
        // return to the profile that was just removed from the Home.
        router.dismissAll();
      } catch (err) {
        // Failure: keep the profile exactly as it was on screen, just
        // surface a gentle, retryable message.
        setDeleting(false);
        setDeleteError(toError(err));
      }
    },
  };
}
