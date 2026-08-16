import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { MedicationForm } from '@/features/medications/medication-form';
import { toMedicationRoutineInput } from '@/features/medications/medication-form-values';
import { useMedication } from '@/hooks/use-medication';
import * as medicationService from '@/services/medication-service';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { medication, loading, error, refresh } = useMedication(id);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando medicamento…" />
      </ScreenContainer>
    );
  }

  if (error || !medication) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {submitError ? <ErrorState onRetry={() => setSubmitError(null)} /> : null}
      <MedicationForm
        submitLabel="Salvar alterações"
        defaultValues={{
          name: medication.name,
          dosage: medication.dosage ?? '',
          quantityPerDose: medication.quantityPerDose ?? '',
          notes: medication.notes ?? '',
          times: medication.times,
          startDate: medication.startDate,
          endMode: medication.endMode,
          endDate: medication.endDate ?? '',
          totalScheduledDoses:
            medication.totalScheduledDoses !== null ? String(medication.totalScheduledDoses) : '',
        }}
        onSubmit={async (values) => {
          try {
            await medicationService.updateMedication(medication.id, {
              profileId: medication.profileId,
              ...toMedicationRoutineInput(values),
            });
            router.back();
          } catch (err) {
            setSubmitError(err instanceof Error ? err : new Error(String(err)));
          }
        }}
      />
    </ScreenContainer>
  );
}
