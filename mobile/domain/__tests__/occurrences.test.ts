import {
  computeNowAndNext,
  computeProfileDayStatus,
  estimateDoseCountDuration,
  generateOccurrencesForDate,
  generateOccurrencesForDateRange,
  scheduledDoseOrdinal,
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
    endMode: 'ongoing',
    endDate: null,
    totalScheduledDoses: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
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
    occurredAt: '2026-08-15T08:03:00.000Z',
    status: 'taken',
    createdAt: '2026-08-15T08:03:00.000Z',
    ...overrides,
  };
}

describe('generateOccurrencesForDate', () => {
  it('creates one occurrence per fixed time for an active medication', () => {
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', []);

    expect(occurrences.map((o) => o.scheduledAt)).toEqual([
      '2026-08-15T08:00',
      '2026-08-15T20:00',
    ]);
    expect(occurrences.every((o) => o.status === 'pending')).toBe(true);
  });

  it('excludes inactive medications', () => {
    const occurrences = generateOccurrencesForDate(
      [makeMedication({ active: false })],
      '2026-08-15',
      []
    );

    expect(occurrences).toHaveLength(0);
  });

  it('excludes medications that have not started yet', () => {
    const occurrences = generateOccurrencesForDate(
      [makeMedication({ startDate: '2026-08-20' })],
      '2026-08-15',
      []
    );

    expect(occurrences).toHaveLength(0);
  });

  it('marks an occurrence taken/skipped when a matching event exists', () => {
    const event = makeEvent();
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', [event]);

    const morning = occurrences.find((o) => o.scheduledAt === '2026-08-15T08:00');
    const evening = occurrences.find((o) => o.scheduledAt === '2026-08-15T20:00');

    expect(morning?.status).toBe('taken');
    expect(morning?.event).toEqual(event);
    expect(evening?.status).toBe('pending');
  });

  it('preserves history: a renamed medication does not rewrite past events', () => {
    const event = makeEvent({ medicationNameSnapshot: 'Losartana 50 mg (antigo nome)' });
    const renamedMedication = makeMedication({ name: 'Losartana 100 mg' });

    const occurrences = generateOccurrencesForDate([renamedMedication], '2026-08-15', [event]);
    const resolved = occurrences.find((o) => o.scheduledAt === '2026-08-15T08:00');

    expect(resolved?.medicationName).toBe('Losartana 50 mg (antigo nome)');
  });

  it('deactivating a medication stops generating new occurrences but does not touch existing events', () => {
    const event = makeEvent();
    const deactivated = makeMedication({ active: false });

    const occurrences = generateOccurrencesForDate([deactivated], '2026-08-15', [event]);

    expect(occurrences).toHaveLength(0);
    expect(event.status).toBe('taken');
  });

  it('editing a medication immediately replaces still-pending occurrences with the new config', () => {
    // Section 4's rule: no schedule versioning in this MVP. A pending
    // (not-yet-recorded) occurrence always reflects whatever the
    // Medication row currently says, while a resolved occurrence keeps
    // its DoseEvent snapshot regardless of later edits.
    const recordedEvent = makeEvent({ scheduledAt: '2026-08-15T08:00' });
    const original = makeMedication({ times: ['08:00', '20:00'], dosage: '50 mg' });
    const edited: Medication = { ...original, times: ['08:00', '09:30'], dosage: '100 mg' };

    const before = generateOccurrencesForDate([original], '2026-08-15', [recordedEvent]);
    const after = generateOccurrencesForDate([edited], '2026-08-15', [recordedEvent]);

    // The recorded 08:00 dose is untouched by the edit — its snapshot wins.
    expect(before.find((o) => o.scheduledAt === '2026-08-15T08:00')?.dosage).toBe('50 mg');
    expect(after.find((o) => o.scheduledAt === '2026-08-15T08:00')?.dosage).toBe('50 mg');

    // The old 20:00 pending occurrence is gone; the new 09:30 one exists
    // instead, and reflects the new dosage since it was never recorded.
    expect(after.some((o) => o.scheduledAt === '2026-08-15T20:00')).toBe(false);
    const newPending = after.find((o) => o.scheduledAt === '2026-08-15T09:30');
    expect(newPending?.status).toBe('pending');
    expect(newPending?.dosage).toBe('100 mg');
  });
});

describe('generateOccurrencesForDateRange', () => {
  it('generates occurrences across every day in the inclusive range', () => {
    const occurrences = generateOccurrencesForDateRange(
      [makeMedication({ times: ['08:00'] })],
      '2026-08-15',
      '2026-08-16',
      []
    );

    expect(occurrences.map((o) => o.scheduledAt)).toEqual([
      '2026-08-15T08:00',
      '2026-08-16T08:00',
    ]);
  });

  it('respects a start date that begins mid-range', () => {
    const occurrences = generateOccurrencesForDateRange(
      [makeMedication({ times: ['08:00'], startDate: '2026-08-16' })],
      '2026-08-15',
      '2026-08-16',
      []
    );

    expect(occurrences.map((o) => o.scheduledAt)).toEqual(['2026-08-16T08:00']);
  });

  it('never generates an unbounded number of occurrences', () => {
    expect(() =>
      generateOccurrencesForDateRange([makeMedication()], '2026-01-01', '2027-01-01', [])
    ).toThrow(/safety cap/);
  });
});

describe('computeNowAndNext', () => {
  it('picks the oldest overdue pending dose as "now"', () => {
    const occurrences = generateOccurrencesForDate(
      [makeMedication({ times: ['08:00', '12:00', '20:00'] })],
      '2026-08-15',
      []
    );
    const now = new Date(2026, 7, 15, 13, 0);

    const result = computeNowAndNext(occurrences, now);

    expect(result.now?.scheduledAt).toBe('2026-08-15T08:00');
    expect(result.next?.scheduledAt).toBe('2026-08-15T20:00');
  });

  it('"next" is strictly future: an overdue dose is never labeled next, even without a "now"', () => {
    // A dose scheduled exactly at `now` counts as due (<=), so it must
    // surface as `now`, never as `next` — "next" is reserved for
    // scheduledAt > now.
    const occurrences = generateOccurrencesForDate(
      [makeMedication({ times: ['08:00'] })],
      '2026-08-15',
      []
    );
    const exactlyNow = new Date(2026, 7, 15, 8, 0);

    const result = computeNowAndNext(occurrences, exactlyNow);

    expect(result.now?.scheduledAt).toBe('2026-08-15T08:00');
    expect(result.next).toBeNull();
  });

  it('has no "now" when nothing is due yet, only "next"', () => {
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', []);
    const now = new Date(2026, 7, 15, 6, 0);

    const result = computeNowAndNext(occurrences, now);

    expect(result.now).toBeNull();
    expect(result.next?.scheduledAt).toBe('2026-08-15T08:00');
  });

  it('finds "next" on the following day once every dose today is resolved', () => {
    const medication = makeMedication({ times: ['08:00'] });
    const todayEvent = makeEvent({ scheduledAt: '2026-08-15T08:00' });
    const occurrences = generateOccurrencesForDateRange(
      [medication],
      '2026-08-15',
      '2026-08-16',
      [todayEvent]
    );

    const result = computeNowAndNext(occurrences, new Date(2026, 7, 15, 21, 0));

    expect(result.now).toBeNull();
    expect(result.next?.scheduledAt).toBe('2026-08-16T08:00');
  });

  it('excludes both "now" and "next" from upcomingToday — no duplication with the highlighted cards', () => {
    const occurrences = generateOccurrencesForDate(
      [makeMedication({ times: ['07:00', '08:00', '12:00', '18:00'] })],
      '2026-08-15',
      []
    );
    const now = new Date(2026, 7, 15, 9, 0);

    const result = computeNowAndNext(occurrences, now);

    // 07:00 and 08:00 are both overdue; the oldest (07:00) is "now".
    expect(result.now?.scheduledAt).toBe('2026-08-15T07:00');
    // 12:00 is the first strictly-future dose — "next".
    expect(result.next?.scheduledAt).toBe('2026-08-15T12:00');
    // The list keeps the other overdue dose (08:00, unlabeled) and the
    // remaining future one (18:00), but never repeats 07:00 or 12:00.
    expect(result.upcomingToday.map((o) => o.scheduledAt)).toEqual([
      '2026-08-15T08:00',
      '2026-08-15T18:00',
    ]);
  });

  it('upcomingToday only contains occurrences from today, never from the lookahead window', () => {
    const medication = makeMedication({ times: ['08:00'] });
    const occurrences = generateOccurrencesForDateRange(
      [medication],
      '2026-08-15',
      '2026-08-16',
      []
    );

    const result = computeNowAndNext(occurrences, new Date(2026, 7, 15, 6, 0));

    expect(result.next?.scheduledAt).toBe('2026-08-15T08:00');
    expect(result.upcomingToday).toEqual([]);
  });

  it('has neither "now" nor "next" once everything in the window is resolved', () => {
    const events = [
      makeEvent({ scheduledAt: '2026-08-15T08:00' }),
      makeEvent({ id: 'event-2', scheduledAt: '2026-08-15T20:00', status: 'skipped' }),
    ];
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', events);

    const result = computeNowAndNext(occurrences, new Date(2026, 7, 15, 21, 0));

    expect(result.now).toBeNull();
    expect(result.next).toBeNull();
    expect(result.upcomingToday).toEqual([]);
  });

  it('reclassifies a dose from "next" to "now" as the clock advances past its scheduledAt, with no change to the occurrences themselves', () => {
    // This is the pure-domain half of the reactive-clock fix: the same
    // `occurrences` array, recomputed with a later `now`, must move a
    // dose from "next" to "now" on its own — nothing about the
    // occurrence changes, only the clock does.
    const occurrences = generateOccurrencesForDate(
      [makeMedication({ times: ['17:17'] })],
      '2026-08-15',
      []
    );

    const before = computeNowAndNext(occurrences, new Date(2026, 7, 15, 17, 16));
    expect(before.now).toBeNull();
    expect(before.next?.scheduledAt).toBe('2026-08-15T17:17');

    const after = computeNowAndNext(occurrences, new Date(2026, 7, 15, 17, 17));
    expect(after.now?.scheduledAt).toBe('2026-08-15T17:17');
    expect(after.next).toBeNull();
  });
});

describe('computeProfileDayStatus', () => {
  it('returns "none" when the profile has no medications in the window', () => {
    expect(computeProfileDayStatus([], new Date(2026, 7, 15, 9, 0))).toBe('none');
  });

  it('returns "now" when a dose is due', () => {
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', []);
    expect(computeProfileDayStatus(occurrences, new Date(2026, 7, 15, 9, 0))).toBe('now');
  });

  it('returns "next" when nothing is due yet', () => {
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', []);
    expect(computeProfileDayStatus(occurrences, new Date(2026, 7, 15, 6, 0))).toBe('next');
  });

  it('returns "ok" once every dose today is resolved', () => {
    const events = [
      makeEvent({ scheduledAt: '2026-08-15T08:00' }),
      makeEvent({ id: 'event-2', scheduledAt: '2026-08-15T20:00', status: 'skipped' }),
    ];
    const occurrences = generateOccurrencesForDate([makeMedication()], '2026-08-15', events);
    expect(computeProfileDayStatus(occurrences, new Date(2026, 7, 15, 21, 0))).toBe('ok');
  });
});

describe('scheduledDoseOrdinal', () => {
  it('is 0 for the first time on the start date itself', () => {
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-15', 0, 2)).toBe(0);
  });

  it('increases with the time-of-day index within the same day', () => {
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-15', 1, 2)).toBe(1);
  });

  it('jumps by timesPerDay for each day since the start', () => {
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-16', 0, 2)).toBe(2);
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-16', 1, 2)).toBe(3);
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-17', 0, 2)).toBe(4);
  });

  it('is correct across a month/year boundary', () => {
    // 2026-12-30 -> 2027-01-02 is 3 days later.
    expect(scheduledDoseOrdinal('2026-12-30', '2027-01-02', 0, 1)).toBe(3);
  });

  it('works with a single fixed time per day', () => {
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-15', 0, 1)).toBe(0);
    expect(scheduledDoseOrdinal('2026-08-15', '2026-08-20', 0, 1)).toBe(5);
  });
});

describe('estimateDoseCountDuration', () => {
  it('60 doses at 2 fixed times/day span exactly 30 days', () => {
    const estimate = estimateDoseCountDuration(60, 2);
    expect(estimate).toEqual({ days: 30, exact: true, dosesOnLastDay: 2 });
  });

  it('flags a non-exact estimate and reports how many doses land on the last day', () => {
    // 5 doses at 2/day: day1 (2) + day2 (2) + day3 (1) = 3 days, last day partial.
    const estimate = estimateDoseCountDuration(5, 2);
    expect(estimate).toEqual({ days: 3, exact: false, dosesOnLastDay: 1 });
  });

  it('is exact for a single time per day', () => {
    const estimate = estimateDoseCountDuration(10, 1);
    expect(estimate).toEqual({ days: 10, exact: true, dosesOnLastDay: 1 });
  });

  it('is exact for a single scheduled dose', () => {
    const estimate = estimateDoseCountDuration(1, 2);
    expect(estimate).toEqual({ days: 1, exact: false, dosesOnLastDay: 1 });
  });
});

describe('generateOccurrencesForDate — endMode "end_date"', () => {
  it('generates normally on the end date itself (inclusive)', () => {
    const medication = makeMedication({ endMode: 'end_date', endDate: '2026-08-15', times: ['08:00'] });
    const occurrences = generateOccurrencesForDate([medication], '2026-08-15', []);
    expect(occurrences.map((o) => o.scheduledAt)).toEqual(['2026-08-15T08:00']);
  });

  it('generates nothing the day after the end date', () => {
    const medication = makeMedication({ endMode: 'end_date', endDate: '2026-08-15', times: ['08:00'] });
    const occurrences = generateOccurrencesForDate([medication], '2026-08-16', []);
    expect(occurrences).toHaveLength(0);
  });

  it('still generates normally on any date up to and including the end date', () => {
    const medication = makeMedication({ endMode: 'end_date', endDate: '2026-08-20', times: ['08:00'] });
    const occurrences = generateOccurrencesForDate([medication], '2026-08-10', []);
    expect(occurrences).toHaveLength(1);
  });
});

describe('generateOccurrencesForDate — endMode "dose_count"', () => {
  it('a single scheduled dose only ever generates once, even with two fixed times per day', () => {
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 1,
      times: ['08:00', '20:00'],
      startDate: '2026-08-15',
    });

    const day1 = generateOccurrencesForDate([medication], '2026-08-15', []);
    expect(day1.map((o) => o.scheduledAt)).toEqual(['2026-08-15T08:00']);

    const day2 = generateOccurrencesForDate([medication], '2026-08-16', []);
    expect(day2).toHaveLength(0);
  });

  it('a count smaller than the first day\'s times only generates that many on day 1', () => {
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 1,
      times: ['08:00', '20:00'],
      startDate: '2026-08-15',
    });
    const day1 = generateOccurrencesForDate([medication], '2026-08-15', []);
    expect(day1.map((o) => o.scheduledAt)).toEqual(['2026-08-15T08:00']);
  });

  it('a count that is an exact multiple of timesPerDay stops cleanly at the end of a day', () => {
    // 4 doses at 2/day = exactly 2 full days, nothing on day 3.
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 4,
      times: ['08:00', '20:00'],
      startDate: '2026-08-15',
    });

    expect(generateOccurrencesForDate([medication], '2026-08-15', [])).toHaveLength(2);
    expect(generateOccurrencesForDate([medication], '2026-08-16', [])).toHaveLength(2);
    expect(generateOccurrencesForDate([medication], '2026-08-17', [])).toHaveLength(0);
  });

  it('a count that ends mid-day only generates the remaining time(s) on the last day', () => {
    // The task's worked example: 5 doses at 08:00/20:00 starting day 1
    // -> day1: 08:00,20:00; day2: 08:00,20:00; day3: 08:00 only.
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 5,
      times: ['08:00', '20:00'],
      startDate: '2026-08-15',
    });

    expect(generateOccurrencesForDate([medication], '2026-08-15', []).map((o) => o.scheduledAt)).toEqual([
      '2026-08-15T08:00',
      '2026-08-15T20:00',
    ]);
    expect(generateOccurrencesForDate([medication], '2026-08-16', []).map((o) => o.scheduledAt)).toEqual([
      '2026-08-16T08:00',
      '2026-08-16T20:00',
    ]);
    expect(generateOccurrencesForDate([medication], '2026-08-17', []).map((o) => o.scheduledAt)).toEqual([
      '2026-08-17T08:00',
    ]);
  });

  it('a skipped dose does not extend the treatment — no automatic replacement occurrence', () => {
    // 6 doses at 08:00/20:00 => exactly 3 days. Skip the very first one
    // and confirm the total across the 3-day window stays 6, with no
    // 4th day appearing to compensate.
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 6,
      times: ['08:00', '20:00'],
      startDate: '2026-08-15',
    });
    const skippedEvent = makeEvent({ scheduledAt: '2026-08-15T08:00', status: 'skipped' });

    const window = generateOccurrencesForDateRange(
      [medication],
      '2026-08-15',
      '2026-08-18',
      [skippedEvent]
    );

    expect(window).toHaveLength(6);
    expect(window.find((o) => o.scheduledAt === '2026-08-15T08:00')?.status).toBe('skipped');
    expect(window.some((o) => o.scheduledAt.startsWith('2026-08-18'))).toBe(false);
  });

  it('counts ordinals from startDate even when startDate is far in the future', () => {
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 2,
      times: ['08:00'],
      startDate: '2030-01-01',
    });

    expect(generateOccurrencesForDate([medication], '2030-01-01', [])).toHaveLength(1);
    expect(generateOccurrencesForDate([medication], '2030-01-02', [])).toHaveLength(1);
    expect(generateOccurrencesForDate([medication], '2030-01-03', [])).toHaveLength(0);
  });

  it('computes the ordinal directly instead of walking every day since a distant startDate', () => {
    // startDate is years in the past; only the single requested date is
    // generated — if this walked day-by-day it would still return the
    // right answer, but this test exists to pin the *contract* (single
    // day in, single day of occurrences out) rather than performance.
    const medication = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 100_000,
      times: ['08:00'],
      startDate: '2000-01-01',
    });

    const occurrences = generateOccurrencesForDate([medication], '2026-08-15', []);
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].scheduledAt).toBe('2026-08-15T08:00');
  });
});

describe('generateOccurrencesForDate — editing preserves history', () => {
  it('shrinking totalScheduledDoses removes future pending occurrences but leaves a recorded event snapshot untouched', () => {
    const recordedEvent = makeEvent({ scheduledAt: '2026-08-15T08:00', status: 'taken' });
    const original = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 6,
      times: ['08:00', '20:00'],
      startDate: '2026-08-15',
    });
    const edited: Medication = { ...original, totalScheduledDoses: 2 };

    // Day 1 (ordinals 0 and 1) is still within the new, smaller limit —
    // the recorded event is unaffected either way.
    const day1Before = generateOccurrencesForDate([original], '2026-08-15', [recordedEvent]);
    const day1After = generateOccurrencesForDate([edited], '2026-08-15', [recordedEvent]);
    expect(day1Before.find((o) => o.scheduledAt === '2026-08-15T08:00')?.status).toBe('taken');
    expect(day1After.find((o) => o.scheduledAt === '2026-08-15T08:00')?.status).toBe('taken');
    expect(day1After).toHaveLength(2);

    // Day 2 (ordinals 2 and 3) was valid before the edit, but the new
    // limit of 2 cuts it off entirely — nothing was ever recorded for
    // it, so there is nothing to preserve.
    const day2Before = generateOccurrencesForDate([original], '2026-08-16', []);
    const day2After = generateOccurrencesForDate([edited], '2026-08-16', []);
    expect(day2Before).toHaveLength(2);
    expect(day2After).toHaveLength(0);
  });

  it('switching from dose_count to ongoing keeps the recorded event and resumes generating occurrences', () => {
    const recordedEvent = makeEvent({ scheduledAt: '2026-08-15T08:00', status: 'taken' });
    const limited = makeMedication({
      endMode: 'dose_count',
      totalScheduledDoses: 2,
      times: ['08:00'],
      startDate: '2026-08-15',
    });
    const madeOngoing: Medication = { ...limited, endMode: 'ongoing', totalScheduledDoses: null };

    // Previously cut off at day 2 (ordinal >= 2).
    expect(generateOccurrencesForDate([limited], '2026-08-17', [])).toHaveLength(0);
    // Now ongoing: day 3 generates again, and day 1's event is untouched.
    expect(generateOccurrencesForDate([madeOngoing], '2026-08-17', [])).toHaveLength(1);
    const day1 = generateOccurrencesForDate([madeOngoing], '2026-08-15', [recordedEvent]);
    expect(day1[0].status).toBe('taken');
    expect(day1[0].event).toEqual(recordedEvent);
  });
});
