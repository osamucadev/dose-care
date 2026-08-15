import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ProfileForm } from '@/features/profiles/profile-form';
import * as profileService from '@/services/profile-service';

export default function NewProfileScreen() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  return (
    <ScreenContainer>
      {error ? <ErrorState onRetry={() => setError(null)} /> : null}
      <ProfileForm
        submitLabel="Salvar perfil"
        onSubmit={async (values) => {
          try {
            const profile = await profileService.createProfile({
              ...values,
              notes: values.notes || null,
            });
            router.replace(`/profile/${profile.id}`);
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        }}
      />
    </ScreenContainer>
  );
}
