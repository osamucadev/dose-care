import type { MedicationRoutineInput } from '@/database/repositories';
import type { Medication } from '@/domain/types';

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
    allowEarly: values.allowEarly,
  };
}

/**
 * The inverse of `toMedicationRoutineInput`: a persisted medication as
 * the edit form's initial values. Optional text fields become '' and
 * the dose count becomes text, since TextInput values are strings.
 */
export function toMedicationFormValues(medication: Medication): MedicationFormValues {
  return {
    name: medication.name,
    dosage: medication.dosage ?? '',
    quantityPerDose: medication.quantityPerDose ?? '',
    notes: medication.notes ?? '',
    times: medication.times,
    startDate: medication.startDate,
    endMode: medication.endMode,
    endDate: medication.endDate ?? '',
    totalScheduledDoses: medication.totalScheduledDoses !== null ? String(medication.totalScheduledDoses) : '',
    allowEarly: medication.allowEarly,
  };
}
