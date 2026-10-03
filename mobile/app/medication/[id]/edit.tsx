import { useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { MedicationForm } from '@/features/medications/medication-form';
import { useEditMedicationViewModel } from '@/view-models/use-edit-medication-view-model';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useEditMedicationViewModel(id);

  if (vm.status === 'loading') {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando medicamento…" />
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

  return (
    <ScreenContainer>
      {vm.hasSubmitError ? <ErrorState onRetry={vm.dismissSubmitError} /> : null}
      <MedicationForm submitLabel="Salvar alterações" defaultValues={vm.defaultValues} onSubmit={vm.submit} />
    </ScreenContainer>
  );
}
