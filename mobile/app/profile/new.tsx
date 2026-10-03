import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ProfileForm } from '@/features/profiles/profile-form';
import { useNewProfileViewModel } from '@/view-models/use-new-profile-view-model';

export default function NewProfileScreen() {
  const vm = useNewProfileViewModel();

  return (
    <ScreenContainer>
      {vm.hasSubmitError ? <ErrorState onRetry={vm.dismissSubmitError} /> : null}
      <ProfileForm submitLabel="Salvar perfil" onSubmit={vm.submit} />
    </ScreenContainer>
  );
}
