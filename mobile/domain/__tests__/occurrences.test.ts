import {
  computeNowAndNext,
  computeProfileDayStatus,
  generateDailyOccurrences,
} from '../occurrences';
import type { DoseEvent, Medication } from '../types';

function makeMedication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    profileId: 'profile-1',
    name: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: '1 comprimido',
    notes: null,
    times: ['08:00', '20:00'],
    startDate: '2026-08-01',
    active: true,
    createdAt: '2026-08-01T00:00:00',
    updatedAt: '2026-08-01T00:00:00',
    ...overrides,
  };
}

function makeEvent(overrides: Partial<DoseEvent> = {}): DoseEvent {
  return {
    id: 'event-1',
    profileId: 'profile-1',
    medicationId: 'med-1',
    medicationNameSnapshot: 'Losartana',
    dosageSnapshot: '50 mg',
    quantitySnapshot: '1 comprimido',
    scheduledAt: '2026-08-15T08:00',
    occurredAt: '2026-08-15T08:03:00',
    status: 'taken',
    createdAt: '2026-08-15T08:03:00',
    ...overrides,
  };
}

describe('generateDailyOccurrences', () => {
  it('creates one occurrence per fixed time for an active medication', () => {
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', []);

    expect(occurrences.map((o) => o.scheduledAt)).toEqual([
      '2026-08-15T08:00',
      '2026-08-15T20:00',
    ]);
    expect(occurrences.every((o) => o.status === 'pending')).toBe(true);
  });

  it('excludes inactive medications', () => {
    const occurrences = generateDailyOccurrences(
      [makeMedication({ active: false })],
      '2026-08-15',
      []
    );

    expect(occurrences).toHaveLength(0);
  });

  it('excludes medications that have not started yet', () => {
    const occurrences = generateDailyOccurrences(
      [makeMedication({ startDate: '2026-08-20' })],
      '2026-08-15',
      []
    );

    expect(occurrences).toHaveLength(0);
  });

  it('marks an occurrence taken/skipped when a matching event exists', () => {
    const event = makeEvent();
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', [event]);

    const morning = occurrences.find((o) => o.scheduledAt === '2026-08-15T08:00');
    const evening = occurrences.find((o) => o.scheduledAt === '2026-08-15T20:00');

    expect(morning?.status).toBe('taken');
    expect(morning?.event).toEqual(event);
    expect(evening?.status).toBe('pending');
  });

  it('preserves history: a renamed medication does not rewrite past events', () => {
    const event = makeEvent({ medicationNameSnapshot: 'Losartana 50 mg (antigo nome)' });
    const renamedMedication = makeMedication({ name: 'Losartana 100 mg' });

    const occurrences = generateDailyOccurrences([renamedMedication], '2026-08-15', [event]);
    const resolved = occurrences.find((o) => o.scheduledAt === '2026-08-15T08:00');

    expect(resolved?.medicationName).toBe('Losartana 50 mg (antigo nome)');
  });

  it('deactivating a medication stops generating new occurrences but does not touch existing events', () => {
    const event = makeEvent();
    const deactivated = makeMedication({ active: false });

    const occurrences = generateDailyOccurrences([deactivated], '2026-08-15', [event]);

    expect(occurrences).toHaveLength(0);
    expect(event.status).toBe('taken');
  });
});

describe('computeNowAndNext', () => {
  it('picks the oldest overdue pending dose as "now"', () => {
    const occurrences = generateDailyOccurrences(
      [makeMedication({ times: ['08:00', '12:00', '20:00'] })],
      '2026-08-15',
      []
    );
    const now = new Date(2026, 7, 15, 13, 0);

    const result = computeNowAndNext(occurrences, now);

    expect(result.now?.scheduledAt).toBe('2026-08-15T08:00');
    expect(result.next?.scheduledAt).toBe('2026-08-15T12:00');
    expect(result.upcomingToday.map((o) => o.scheduledAt)).toEqual([
      '2026-08-15T12:00',
      '2026-08-15T20:00',
    ]);
  });

  it('has no "now" when nothing is due yet, only "next"', () => {
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', []);
    const now = new Date(2026, 7, 15, 6, 0);

    const result = computeNowAndNext(occurrences, now);

    expect(result.now).toBeNull();
    expect(result.next?.scheduledAt).toBe('2026-08-15T08:00');
  });

  it('has neither "now" nor "next" once everything is resolved', () => {
    const events = [
      makeEvent({ scheduledAt: '2026-08-15T08:00' }),
      makeEvent({ id: 'event-2', scheduledAt: '2026-08-15T20:00', status: 'skipped' }),
    ];
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', events);

    const result = computeNowAndNext(occurrences, new Date(2026, 7, 15, 21, 0));

    expect(result.now).toBeNull();
    expect(result.next).toBeNull();
  });
});

describe('computeProfileDayStatus', () => {
  it('returns "none" when the profile has no medications today', () => {
    expect(computeProfileDayStatus([], new Date(2026, 7, 15, 9, 0))).toBe('none');
  });

  it('returns "now" when a dose is due', () => {
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', []);
    expect(computeProfileDayStatus(occurrences, new Date(2026, 7, 15, 9, 0))).toBe('now');
  });

  it('returns "next" when nothing is due yet', () => {
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', []);
    expect(computeProfileDayStatus(occurrences, new Date(2026, 7, 15, 6, 0))).toBe('next');
  });

  it('returns "ok" once every dose today is resolved', () => {
    const events = [
      makeEvent({ scheduledAt: '2026-08-15T08:00' }),
      makeEvent({ id: 'event-2', scheduledAt: '2026-08-15T20:00', status: 'skipped' }),
    ];
    const occurrences = generateDailyOccurrences([makeMedication()], '2026-08-15', events);
    expect(computeProfileDayStatus(occurrences, new Date(2026, 7, 15, 21, 0))).toBe('ok');
  });
});
