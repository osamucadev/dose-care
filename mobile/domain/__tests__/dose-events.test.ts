import { createDoseEventFromOccurrence } from '../dose-events';
import { generateDailyOccurrences } from '../occurrences';
import type { Medication } from '../types';

const medication: Medication = {
  id: 'med-1',
  profileId: 'profile-1',
  name: 'Losartana',
  dosage: '50 mg',
  quantityPerDose: '1 comprimido',
  notes: null,
  times: ['08:00'],
  startDate: '2026-08-01',
  active: true,
  createdAt: '2026-08-01T00:00:00',
  updatedAt: '2026-08-01T00:00:00',
};

describe('createDoseEventFromOccurrence', () => {
  it('snapshots the medication fields from the occurrence at the moment of the action', () => {
    const [occurrence] = generateDailyOccurrences([medication], '2026-08-15', []);

    const event = createDoseEventFromOccurrence(occurrence, 'taken', {
      id: 'event-1',
      occurredAt: '2026-08-15T08:03:12',
    });

    expect(event).toMatchObject({
      id: 'event-1',
      profileId: 'profile-1',
      medicationId: 'med-1',
      medicationNameSnapshot: 'Losartana',
      dosageSnapshot: '50 mg',
      quantitySnapshot: '1 comprimido',
      scheduledAt: '2026-08-15T08:00',
      occurredAt: '2026-08-15T08:03:12',
      status: 'taken',
    });
  });

  it('records a skipped dose the same way, without altering the schedule', () => {
    const [occurrence] = generateDailyOccurrences([medication], '2026-08-15', []);

    const event = createDoseEventFromOccurrence(occurrence, 'skipped', {
      id: 'event-2',
      occurredAt: '2026-08-15T08:05:00',
    });

    expect(event.status).toBe('skipped');
    expect(event.scheduledAt).toBe(occurrence.scheduledAt);
  });
});
