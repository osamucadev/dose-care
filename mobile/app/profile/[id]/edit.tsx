import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { ProfileForm } from '@/features/profiles/profile-form';
import { useProfile } from '@/hooks/use-profile';
import * as profileService from '@/services/profile-service';
import { spacing } from '@/theme/tokens';

export default function EditProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading, error, refresh } = useProfile(id);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

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

  async function confirmDelete() {
    if (!profile) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await profileService.deactivateProfile(profile.id);
      // Clears Profile + Edit off the stack so the back button can't
      // return to the profile that was just removed from the Home.
      router.dismissAll();
    } catch (err) {
      // Failure: keep the profile exactly as it was on screen, just
      // surface a gentle, retryable message.
      setIsDeleting(false);
      setDeleteError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  function handleDeletePress() {
    if (isDeleting) return;
    Alert.alert(
      'Excluir perfil?',
      'O perfil será removido da Home, mas seu histórico será preservado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void confirmDelete() },
      ]
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

      <View style={styles.dangerZone}>
        {deleteError ? (
          <ErrorState
            message="Não foi possível excluir o perfil agora."
            onRetry={() => setDeleteError(null)}
          />
        ) : null}
        <ThemedText variant="muted">
          Excluir remove {profile.name} da Home. O histórico continua guardado.
        </ThemedText>
        <Button
          label="Excluir perfil"
          variant="destructive"
          loading={isDeleting}
          disabled={isDeleting}
          onPress={handleDeletePress}
          accessibilityHint="Remove o perfil da Home. O histórico é preservado."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dangerZone: { gap: spacing.sm, marginTop: spacing.xl },
});
