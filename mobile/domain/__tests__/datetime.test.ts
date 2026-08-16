import {
  addDaysToLocalDateString,
  daysBetweenLocalDates,
  formatUtcIsoToLocalTime,
  inclusiveDaySpan,
  isValidLocalDateString,
  isValidScheduledLocalDateTime,
  isValidTimeString,
  isValidUtcIsoTimestamp,
  nowUtcIso,
  parseScheduledLocalDateTime,
  toLocalDateString,
  toLocalTimeString,
  toScheduledLocalDateTime,
} from '../datetime';

describe('local date/time helpers', () => {
  it('formats a Date using local calendar fields, not UTC', () => {
    const date = new Date(2026, 7, 15, 8, 5, 0); // 15 Aug 2026, 08:05 local
    expect(toLocalDateString(date)).toBe('2026-08-15');
    expect(toLocalTimeString(date)).toBe('08:05');
  });

  it('round-trips a scheduled local datetime string back to the same wall-clock time', () => {
    const value = toScheduledLocalDateTime('2026-08-15', '08:00');
    const parsed = parseScheduledLocalDateTime(value);

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(15);
    expect(parsed.getHours()).toBe(8);
    expect(parsed.getMinutes()).toBe(0);
  });

  it('validates HH:mm time strings', () => {
    expect(isValidTimeString('08:00')).toBe(true);
    expect(isValidTimeString('23:59')).toBe(true);
    expect(isValidTimeString('24:00')).toBe(false);
    expect(isValidTimeString('8:00')).toBe(false);
  });

  it('validates real calendar dates', () => {
    expect(isValidLocalDateString('2026-02-30')).toBe(false);
    expect(isValidLocalDateString('2026-08-15')).toBe(true);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDaysToLocalDateString('2026-08-15', 1)).toBe('2026-08-16');
    expect(addDaysToLocalDateString('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDaysToLocalDateString('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('daysBetweenLocalDates', () => {
  it('is zero for the same date', () => {
    expect(daysBetweenLocalDates('2026-08-15', '2026-08-15')).toBe(0);
  });

  it('counts plain same-month differences', () => {
    expect(daysBetweenLocalDates('2026-08-15', '2026-08-18')).toBe(3);
  });

  it('is negative when the second date comes first', () => {
    expect(daysBetweenLocalDates('2026-08-18', '2026-08-15')).toBe(-3);
  });

  it('counts correctly across a month boundary', () => {
    // Jan has 31 days: Jan 30 -> Feb 2 is 3 days.
    expect(daysBetweenLocalDates('2026-01-30', '2026-02-02')).toBe(3);
  });

  it('counts correctly across a year boundary', () => {
    expect(daysBetweenLocalDates('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('handles a leap-year February correctly', () => {
    // 2028 is a leap year: Feb has 29 days.
    expect(daysBetweenLocalDates('2028-02-28', '2028-03-01')).toBe(2);
    // 2026 is not: Feb has 28 days.
    expect(daysBetweenLocalDates('2026-02-28', '2026-03-01')).toBe(1);
  });
});

describe('inclusiveDaySpan', () => {
  it('is 1 for a single-day treatment (start === end)', () => {
    expect(inclusiveDaySpan('2026-08-15', '2026-08-15')).toBe(1);
  });

  it('counts both the start and end date', () => {
    expect(inclusiveDaySpan('2026-08-15', '2026-08-22')).toBe(8);
  });

  it('counts correctly across a month/year boundary', () => {
    expect(inclusiveDaySpan('2026-12-30', '2027-01-02')).toBe(4);
  });
});

describe('UTC timestamp helpers', () => {
  it('nowUtcIso returns a UTC ISO 8601 timestamp', () => {
    const fixed = new Date(Date.UTC(2026, 7, 15, 11, 3, 12));
    expect(nowUtcIso(fixed)).toBe('2026-08-15T11:03:12.000Z');
  });

  it('formatUtcIsoToLocalTime converts a UTC instant to the local wall-clock time', () => {
    // A UTC instant of 00:00 is 21:00 the previous day in UTC-3 — verify
    // the conversion goes through the JS Date local getters, not a
    // naive string slice of the UTC representation.
    const utcMidnight = '2026-08-15T00:00:00.000Z';
    const expected = toLocalTimeString(new Date(utcMidnight));
    expect(formatUtcIsoToLocalTime(utcMidnight)).toBe(expected);
  });

  it('isValidUtcIsoTimestamp accepts a well-formed UTC instant', () => {
    expect(isValidUtcIsoTimestamp('2026-08-15T11:03:12.000Z')).toBe(true);
    expect(isValidUtcIsoTimestamp('2026-08-15T11:03:12Z')).toBe(true);
  });

  it('isValidUtcIsoTimestamp rejects values that merely look right', () => {
    expect(isValidUtcIsoTimestamp('2026-02-30T10:00:00.000Z')).toBe(false); // no Feb 30th
    expect(isValidUtcIsoTimestamp('2026-08-15T25:00:00.000Z')).toBe(false); // hour out of range
    expect(isValidUtcIsoTimestamp('2026-08-15T11:03:12.000')).toBe(false); // missing "Z"
    expect(isValidUtcIsoTimestamp('2026-08-15T11:03:12+03:00')).toBe(false); // offset, not "Z"
    expect(isValidUtcIsoTimestamp('not a timestamp')).toBe(false);
  });
});

describe('isValidScheduledLocalDateTime', () => {
  it('accepts a well-formed scheduledAt', () => {
    expect(isValidScheduledLocalDateTime('2026-08-15T08:00')).toBe(true);
  });

  it('rejects values that merely look right', () => {
    expect(isValidScheduledLocalDateTime('2026-02-30T08:00')).toBe(false); // no Feb 30th
    expect(isValidScheduledLocalDateTime('2026-08-15T25:61')).toBe(false); // impossible time
    expect(isValidScheduledLocalDateTime('2026-08-15T08:00:00')).toBe(false); // seconds not allowed
    expect(isValidScheduledLocalDateTime('2026-08-15 08:00')).toBe(false); // missing "T"
    expect(isValidScheduledLocalDateTime('')).toBe(false);
  });
});
