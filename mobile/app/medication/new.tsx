import { useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { MedicationForm } from '@/features/medications/medication-form';
import { useNewMedicationViewModel } from '@/view-models/use-new-medication-view-model';

export default function NewMedicationScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const vm = useNewMedicationViewModel(profileId);

  return (
    <ScreenContainer>
      {vm.hasSubmitError ? <ErrorState onRetry={vm.dismissSubmitError} /> : null}
      <MedicationForm submitLabel="Salvar medicamento" onSubmit={vm.submit} />
    </ScreenContainer>
  );
}
