import { normalizeProfileId } from '../route-params';

describe('normalizeProfileId', () => {
  it('passes through a plain non-empty string', () => {
    expect(normalizeProfileId('profile-1')).toBe('profile-1');
  });

  it('takes the first element when given an array', () => {
    expect(normalizeProfileId(['profile-1', 'profile-2'])).toBe('profile-1');
  });

  it('returns null for undefined', () => {
    expect(normalizeProfileId(undefined)).toBeNull();
  });

  it('returns null for an empty array', () => {
    expect(normalizeProfileId([])).toBeNull();
  });

  it('returns null for an empty or blank string', () => {
    expect(normalizeProfileId('')).toBeNull();
    expect(normalizeProfileId('   ')).toBeNull();
  });
});
