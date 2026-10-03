import { formatHomeDate } from '../home-date';

describe('formatHomeDate', () => {
  it('formats weekday, day and month in short pt-BR form', () => {
    expect(formatHomeDate(new Date(2026, 0, 26))).toBe('Seg, 26 de jan');
  });

  it('does not zero-pad the day', () => {
    expect(formatHomeDate(new Date(2026, 9, 3))).toBe('Sáb, 3 de out');
  });

  it('uses the local calendar date, late at night', () => {
    expect(formatHomeDate(new Date(2026, 11, 31, 23, 59))).toBe('Qui, 31 de dez');
  });
});
