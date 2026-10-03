import { planReminders, reminderBody } from '../reminders';
import type { DoseOccurrence } from '../types';

function makeOccurrence(overrides: Partial<DoseOccurrence> = {}): DoseOccurrence {
  const scheduledAt = overrides.scheduledAt ?? '2026-08-15T20:00';
  return {
    id: `med-1_${scheduledAt}`,
    profileId: 'profile-1',
    medicationId: 'med-1',
    medicationName: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: '1 comprimido',
    scheduledAt,
    status: 'pending',
    event: null,
    ...overrides,
  };
}

const NAMES = { 'profile-1': 'Florita', 'profile-2': 'Nino' };
const NOW = new Date(2026, 7, 15, 12, 0);

describe('reminderBody', () => {
  it('includes dosage and quantity when present', () => {
    expect(reminderBody(makeOccurrence())).toBe('Está na hora: Losartana 50 mg · 1 comprimido.');
  });

  it('omits missing dosage and quantity', () => {
    expect(reminderBody(makeOccurrence({ medicationName: 'Regar', dosage: null, quantityPerDose: null }))).toBe(
      'Está na hora: Regar.'
    );
  });
});

describe('planReminders', () => {
  it('schedules pending future doses with the profile name as title', () => {
    const [item] = planReminders([makeOccurrence()], NAMES, NOW);
    expect(item).toEqual({
      id: 'dose_med-1_2026-08-15T20:00',
      profileId: 'profile-1',
      fireAt: new Date(2026, 7, 15, 20, 0),
      title: 'Florita',
      body: 'Está na hora: Losartana 50 mg · 1 comprimido.',
    });
  });

  it('never re-notifies a dose whose time already passed, nor one due exactly now', () => {
    const plan = planReminders(
      [makeOccurrence({ scheduledAt: '2026-08-15T08:00' }), makeOccurrence({ scheduledAt: '2026-08-15T12:00' })],
      NAMES,
      NOW
    );
    expect(plan).toEqual([]);
  });

  it('skips doses already taken or skipped', () => {
    const plan = planReminders(
      [
        makeOccurrence({ scheduledAt: '2026-08-15T20:00', status: 'taken' }),
        makeOccurrence({ scheduledAt: '2026-08-16T08:00', status: 'skipped' }),
      ],
      NAMES,
      NOW
    );
    expect(plan).toEqual([]);
  });

  it('skips doses of profiles that are no longer listed (soft-deleted)', () => {
    const plan = planReminders([makeOccurrence({ profileId: 'gone' })], NAMES, NOW);
    expect(plan).toEqual([]);
  });

  it('orders by time across profiles and days, and respects the limit', () => {
    const plan = planReminders(
      [
        makeOccurrence({ scheduledAt: '2026-08-16T08:00' }),
        makeOccurrence({ scheduledAt: '2026-08-15T20:00', profileId: 'profile-2', medicationId: 'med-2' }),
        makeOccurrence({ scheduledAt: '2026-08-15T14:00' }),
      ],
      NAMES,
      NOW,
      2
    );
    expect(plan.map((p) => [p.title, p.fireAt.getHours()])).toEqual([
      ['Florita', 14],
      ['Nino', 20],
    ]);
  });
});
