import { mergeReminderPlans, planReminders, planRestockReminders, reminderBody } from '../reminders';
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

describe('planRestockReminders', () => {
  const low = { base: 30, remaining: 3, level: 'low' as const, daysLeft: 3 };
  const item = { medicationId: 'med-1', profileId: 'profile-1', medicationName: 'Losartana', dosage: '50 mg', status: low };

  it('reminds daily at 09:00, starting today when it is still before 09:00', () => {
    const plan = planRestockReminders([item], NAMES, new Date(2026, 7, 15, 7, 30), 3);
    expect(plan.map((p) => p.fireAt)).toEqual([
      new Date(2026, 7, 15, 9, 0),
      new Date(2026, 7, 16, 9, 0),
      new Date(2026, 7, 17, 9, 0),
    ]);
    expect(plan[0]).toMatchObject({
      id: 'restock_med-1_2026-08-15',
      title: 'Estoque de Losartana',
      body: 'Restam 3 doses de Losartana 50 mg (Florita). Que tal providenciar mais?',
    });
  });

  it('starts tomorrow once 09:00 has passed', () => {
    const plan = planRestockReminders([item], NAMES, NOW, 2);
    expect(plan[0].fireAt).toEqual(new Date(2026, 7, 16, 9, 0));
  });

  it('says when the stock ran out', () => {
    const out = { ...item, dosage: null, status: { ...low, remaining: 0, level: 'out' as const } };
    expect(planRestockReminders([out], NAMES, NOW, 1)[0].body).toBe(
      'O estoque de Losartana (Florita) acabou. Quando comprar, registre no app.'
    );
  });

  it('uses the singular for a single dose', () => {
    const one = { ...item, status: { ...low, remaining: 1, level: 'critical' as const } };
    expect(planRestockReminders([one], NAMES, NOW, 1)[0].body).toContain('Restam 1 dose de');
  });

  it('ignores stock that is fine and profiles that are no longer listed', () => {
    const ok = { ...item, status: { ...low, remaining: 20, level: 'ok' as const } };
    expect(planRestockReminders([ok, { ...item, profileId: 'gone' }], NAMES, NOW)).toEqual([]);
  });
});

describe('mergeReminderPlans', () => {
  it('interleaves plans by time and applies the limit', () => {
    const at = (h: number) => ({ id: `r${h}`, profileId: 'p', fireAt: new Date(2026, 7, 15, h), title: '', body: '' });
    expect(mergeReminderPlans([[at(8), at(20)], [at(9)]], 2).map((p) => p.id)).toEqual(['r8', 'r9']);
  });
});
