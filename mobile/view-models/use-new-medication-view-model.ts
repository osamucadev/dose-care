import { useRouter } from 'expo-router';
import { useState } from 'react';

import { toMedicationRoutineInput } from '@/features/medications/medication-form-values';
import type { MedicationFormValues } from '@/features/medications/medication-schema';
import * as medicationService from '@/services/medication-service';

export interface NewMedicationViewModel {
  hasSubmitError: boolean;
  dismissSubmitError: () => void;
  submit: (values: MedicationFormValues) => Promise<void>;
}

export function useNewMedicationViewModel(profileId: string): NewMedicationViewModel {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<Error | null>(null);

  return {
    hasSubmitError: submitError !== null,
    dismissSubmitError: () => setSubmitError(null),
    submit: async (values) => {
      try {
        await medicationService.createMedication({ profileId, ...toMedicationRoutineInput(values) });
        router.back();
      } catch (err) {
        setSubmitError(err instanceof Error ? err : new Error(String(err)));
      }
    },
  };
}
