import {
  combineLocalDateTime,
  isValidLocalDateString,
  isValidTimeString,
  parseLocalDateTime,
  toLocalDateString,
  toLocalTimeString,
} from '../datetime';

describe('local date/time helpers', () => {
  it('formats a Date using local calendar fields, not UTC', () => {
    const date = new Date(2026, 7, 15, 8, 5, 0); // 15 Aug 2026, 08:05 local
    expect(toLocalDateString(date)).toBe('2026-08-15');
    expect(toLocalTimeString(date)).toBe('08:05');
  });

  it('round-trips a combined local datetime string back to the same wall-clock time', () => {
    const value = combineLocalDateTime('2026-08-15', '08:00');
    const parsed = parseLocalDateTime(value);

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
});
