import { useRouter } from 'expo-router';
import { useState } from 'react';

import { toMedicationFormValues, toMedicationRoutineInput } from '@/features/medications/medication-form-values';
import type { MedicationFormValues } from '@/features/medications/medication-schema';
import { useMedication } from '@/hooks/use-medication';
import * as medicationService from '@/services/medication-service';

export type EditMedicationViewModel =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'ready';
      defaultValues: MedicationFormValues;
      hasSubmitError: boolean;
      dismissSubmitError: () => void;
      submit: (values: MedicationFormValues) => Promise<void>;
    };

export function useEditMedicationViewModel(id: string): EditMedicationViewModel {
  const router = useRouter();
  const { medication, loading, error, refresh } = useMedication(id);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  if (loading) return { status: 'loading' };
  if (error || !medication) return { status: 'error', retry: refresh };

  return {
    status: 'ready',
    defaultValues: toMedicationFormValues(medication),
    hasSubmitError: submitError !== null,
    dismissSubmitError: () => setSubmitError(null),
    submit: async (values) => {
      try {
        await medicationService.updateMedication(medication.id, {
          profileId: medication.profileId,
          ...toMedicationRoutineInput(values),
        });
        router.back();
      } catch (err) {
        setSubmitError(err instanceof Error ? err : new Error(String(err)));
      }
    },
  };
}
