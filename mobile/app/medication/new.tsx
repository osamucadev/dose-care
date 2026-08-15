import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { MedicationForm } from '@/features/medications/medication-form';
import * as medicationService from '@/services/medication-service';

export default function NewMedicationScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  return (
    <ScreenContainer>
      {error ? <ErrorState onRetry={() => setError(null)} /> : null}
      <MedicationForm
        submitLabel="Salvar medicamento"
        onSubmit={async (values) => {
          try {
            await medicationService.createMedication({
              profileId,
              name: values.name,
              dosage: values.dosage || null,
              quantityPerDose: values.quantityPerDose || null,
              notes: values.notes || null,
              times: values.times,
              startDate: values.startDate,
            });
            router.back();
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        }}
      />
    </ScreenContainer>
  );
}
