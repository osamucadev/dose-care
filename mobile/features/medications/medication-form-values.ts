import type { MedicationRoutineInput } from '@/database/repositories';

import type { MedicationFormValues } from './medication-schema';

/**
 * Converts validated form values into the repository's write shape.
 * endDate/totalScheduledDoses are derived from `endMode` here too —
 * not just trusted straight off the form's raw string fields — so both
 * screens that submit a medication (create and edit) send the same,
 * already-consistent shape; the repository still re-validates and
 * re-normalizes independently (`assertValidMedicationInput`), since it
 * must not depend solely on the form having done this correctly.
 */
export function toMedicationRoutineInput(
  values: MedicationFormValues
): Omit<MedicationRoutineInput, 'profileId'> {
  return {
    name: values.name,
    dosage: values.dosage || null,
    quantityPerDose: values.quantityPerDose || null,
    notes: values.notes || null,
    times: values.times,
    startDate: values.startDate,
    endMode: values.endMode,
    endDate: values.endMode === 'end_date' ? values.endDate || null : null,
    totalScheduledDoses:
      values.endMode === 'dose_count' && values.totalScheduledDoses
        ? Number(values.totalScheduledDoses)
        : null,
  };
}
