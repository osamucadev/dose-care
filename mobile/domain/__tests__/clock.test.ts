import { didReturnToForeground, hasLocalDateChanged, msUntilNextMinute } from '../clock';

describe('msUntilNextMinute', () => {
  it('computes the exact distance to the next minute boundary', () => {
    const now = new Date(2026, 7, 15, 17, 16, 44, 200); // 17:16:44.200
    expect(msUntilNextMinute(now)).toBe(60_000 - (44 * 1000 + 200));
  });

  it('returns a full minute when already exactly on a boundary', () => {
    const now = new Date(2026, 7, 15, 17, 16, 0, 0);
    expect(msUntilNextMinute(now)).toBe(60_000);
  });

  it('returns a small value just before the boundary', () => {
    const now = new Date(2026, 7, 15, 17, 16, 59, 950);
    expect(msUntilNextMinute(now)).toBe(50);
  });
});

describe('hasLocalDateChanged', () => {
  it('is false while the local date stays the same', () => {
    expect(hasLocalDateChanged('2026-08-15', new Date(2026, 7, 15, 23, 59))).toBe(false);
  });

  it('is true once the local date rolls over', () => {
    expect(hasLocalDateChanged('2026-08-15', new Date(2026, 7, 16, 0, 0))).toBe(true);
  });
});

describe('didReturnToForeground', () => {
  it('is true when transitioning from background to active', () => {
    expect(didReturnToForeground('background', 'active')).toBe(true);
  });

  it('is true when transitioning from inactive to active', () => {
    expect(didReturnToForeground('inactive', 'active')).toBe(true);
  });

  it('is false when already active and staying active', () => {
    expect(didReturnToForeground('active', 'active')).toBe(false);
  });

  it('is false when leaving the foreground', () => {
    expect(didReturnToForeground('active', 'background')).toBe(false);
  });
});
