import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ProfileForm } from '@/features/profiles/profile-form';
import { useProfile } from '@/hooks/use-profile';
import * as profileService from '@/services/profile-service';

export default function EditProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading, error, refresh } = useProfile(id);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando perfil…" />
      </ScreenContainer>
    );
  }

  if (error || !profile) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {submitError ? <ErrorState onRetry={() => setSubmitError(null)} /> : null}
      <ProfileForm
        submitLabel="Salvar alterações"
        defaultValues={{
          name: profile.name,
          type: profile.type,
          avatar: profile.avatar,
          color: profile.color,
          notes: profile.notes ?? '',
        }}
        onSubmit={async (values) => {
          try {
            await profileService.updateProfile(profile.id, { ...values, notes: values.notes || null });
            router.back();
          } catch (err) {
            setSubmitError(err instanceof Error ? err : new Error(String(err)));
          }
        }}
      />
    </ScreenContainer>
  );
}
