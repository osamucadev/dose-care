import { useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { ProfileForm } from '@/features/profiles/profile-form';
import { spacing } from '@/theme/tokens';
import { useEditProfileViewModel } from '@/view-models/use-edit-profile-view-model';

export default function EditProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useEditProfileViewModel(id);

  if (vm.status === 'loading') {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando perfil…" />
      </ScreenContainer>
    );
  }

  if (vm.status === 'error') {
    return (
      <ScreenContainer>
        <ErrorState onRetry={vm.retry} />
      </ScreenContainer>
    );
  }

  function handleDeletePress() {
    if (vm.status !== 'ready' || vm.deleting) return;
    Alert.alert('Excluir perfil?', 'O perfil será removido da Home, mas seu histórico será preservado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void vm.deleteProfile() },
    ]);
  }

  return (
    <ScreenContainer>
      {vm.hasSubmitError ? <ErrorState onRetry={vm.dismissSubmitError} /> : null}
      <ProfileForm submitLabel="Salvar alterações" defaultValues={vm.defaultValues} onSubmit={vm.submit} />

      <View style={styles.dangerZone}>
        {vm.hasDeleteError ? (
          <ErrorState message="Não foi possível excluir o perfil agora." onRetry={vm.dismissDeleteError} />
        ) : null}
        <ThemedText variant="muted">Excluir remove {vm.name} da Home. O histórico continua guardado.</ThemedText>
        <Button
          label="Excluir perfil"
          variant="destructive"
          loading={vm.deleting}
          disabled={vm.deleting}
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
