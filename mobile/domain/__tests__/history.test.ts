import { buildHistoryEntries, wasTakenEarly } from '../history';
import type { DoseEvent, Medication } from '../types';

function event(overrides: Partial<DoseEvent> = {}): DoseEvent {
  return {
    id: 'e1',
    profileId: 'p1',
    medicationId: 'm1',
    medicationNameSnapshot: 'Losartana',
    dosageSnapshot: '50 mg',
    quantitySnapshot: '1 comprimido',
    scheduledAt: '2026-10-04T08:00',
    occurredAt: '2026-10-04T11:03:00.000Z',
    status: 'taken',
    createdAt: '2026-10-04T11:03:00.000Z',
    ...overrides,
  };
}

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    profileId: 'p1',
    name: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: '1 comprimido',
    notes: null,
    times: ['08:00'],
    startDate: '2026-10-01',
    active: true,
    endMode: 'ongoing',
    endDate: null,
    totalScheduledDoses: null,
    allowEarly: false,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildHistoryEntries', () => {
  it('shows the current name of a renamed medication and keeps the recorded one visible', () => {
    const [entry] = buildHistoryEntries([event()], [medication({ name: 'Losartana Potássica' })]);
    expect(entry.medicationName).toBe('Losartana Potássica');
    expect(entry.recordedAsName).toBe('Losartana');
  });

  it('never touches the stored event, including its dosage', () => {
    const stored = event();
    const [entry] = buildHistoryEntries([stored], [medication({ name: 'Outro nome', dosage: '100 mg' })]);
    expect(entry.event).toBe(stored);
    expect(entry.event.dosageSnapshot).toBe('50 mg');
    expect(entry.event.medicationNameSnapshot).toBe('Losartana');
  });

  it('has nothing to add when the name did not change', () => {
    const [entry] = buildHistoryEntries([event()], [medication()]);
    expect(entry).toMatchObject({ medicationName: 'Losartana', recordedAsName: null });
  });

  it('ignores differences in surrounding spaces only', () => {
    const [entry] = buildHistoryEntries([event()], [medication({ name: ' Losartana ' })]);
    expect(entry.recordedAsName).toBeNull();
  });

  it('keeps the recorded name when the medication is not found', () => {
    const [entry] = buildHistoryEntries([event({ medicationId: 'gone' })], [medication()]);
    expect(entry).toMatchObject({ medicationName: 'Losartana', recordedAsName: null });
  });

  it('keeps each event paired with its own medication', () => {
    const entries = buildHistoryEntries(
      [event({ id: 'a' }), event({ id: 'b', medicationId: 'm2', medicationNameSnapshot: 'Omeprazol' })],
      [medication({ name: 'Losartana Potássica' }), medication({ id: 'm2', name: 'Omeprazol' })]
    );
    expect(entries.map((e) => [e.medicationName, e.recordedAsName])).toEqual([
      ['Losartana Potássica', 'Losartana'],
      ['Omeprazol', null],
    ]);
  });
});

describe('wasTakenEarly', () => {
  const localIso = (h: number, m: number) => new Date(2026, 9, 4, h, m).toISOString();

  it('is true for a dose taken before its scheduled time', () => {
    expect(wasTakenEarly(event({ scheduledAt: '2026-10-04T18:00', occurredAt: localIso(17, 30) }))).toBe(true);
  });

  it('is false at or after the scheduled time, and for a skipped dose', () => {
    expect(wasTakenEarly(event({ scheduledAt: '2026-10-04T18:00', occurredAt: localIso(18, 0) }))).toBe(false);
    expect(wasTakenEarly(event({ scheduledAt: '2026-10-04T18:00', occurredAt: localIso(19, 5) }))).toBe(false);
    expect(
      wasTakenEarly(event({ scheduledAt: '2026-10-04T18:00', occurredAt: localIso(17, 30), status: 'skipped' }))
    ).toBe(false);
  });

  it('is part of each history entry', () => {
    const [entry] = buildHistoryEntries(
      [event({ scheduledAt: '2026-10-04T18:00', occurredAt: localIso(17, 30) })],
      [medication()]
    );
    expect(entry.takenEarly).toBe(true);
  });
});
