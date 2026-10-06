import type { Medication } from '@/domain/types';

import { toMedicationFormValues, toMedicationRoutineInput } from '../medication-form-values';

function makeMedication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    profileId: 'profile-1',
    name: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: null,
    notes: null,
    times: ['08:00', '20:00'],
    startDate: '2026-08-01',
    active: true,
    endMode: 'dose_count',
    endDate: null,
    totalScheduledDoses: 60,
    allowEarly: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('toMedicationFormValues', () => {
  it('turns nulls into empty text and the dose count into text', () => {
    expect(toMedicationFormValues(makeMedication())).toEqual({
      name: 'Losartana',
      dosage: '50 mg',
      quantityPerDose: '',
      notes: '',
      times: ['08:00', '20:00'],
      startDate: '2026-08-01',
      endMode: 'dose_count',
      endDate: '',
      totalScheduledDoses: '60',
      allowEarly: false,
    });
  });

  it('round-trips through toMedicationRoutineInput', () => {
    const medication = makeMedication({ endMode: 'end_date', endDate: '2026-08-30', totalScheduledDoses: null });
    expect(toMedicationRoutineInput(toMedicationFormValues(medication))).toEqual({
      name: 'Losartana',
      dosage: '50 mg',
      quantityPerDose: null,
      notes: null,
      times: ['08:00', '20:00'],
      startDate: '2026-08-01',
      endMode: 'end_date',
      endDate: '2026-08-30',
      totalScheduledDoses: null,
      allowEarly: false,
    });
  });

  it('keeps the early-dose option the user set', () => {
    const values = toMedicationFormValues(makeMedication({ allowEarly: true }));
    expect(values.allowEarly).toBe(true);
    expect(toMedicationRoutineInput(values).allowEarly).toBe(true);
  });
});
