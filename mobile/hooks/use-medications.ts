import { useCallback } from 'react';

import type { MedicationRoutineInput } from '@/database/repositories';
import * as medicationService from '@/services/medication-service';

import { useAsyncData } from './use-async-data';

export function useMedications(profileId: string | undefined, options: { includeInactive?: boolean } = {}) {
  const { includeInactive } = options;
  const { data, loading, error, refresh } = useAsyncData(
    () =>
      profileId
        ? medicationService.listMedicationsForProfile(profileId, { includeInactive })
        : Promise.resolve([]),
    [profileId, includeInactive]
  );

  const createMedication = useCallback(
    async (input: MedicationRoutineInput) => {
      const medication = await medicationService.createMedication(input);
      await refresh();
      return medication;
    },
    [refresh]
  );

  const updateMedication = useCallback(
    async (id: string, input: MedicationRoutineInput) => {
      await medicationService.updateMedication(id, input);
      await refresh();
    },
    [refresh]
  );

  const setActive = useCallback(
    async (id: string, active: boolean) => {
      await medicationService.setMedicationActive(id, active);
      await refresh();
    },
    [refresh]
  );

  return { medications: data ?? [], loading, error, refresh, createMedication, updateMedication, setActive };
}
