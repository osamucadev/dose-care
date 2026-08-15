import { reconcileSelectedProfileId } from '../profile-selection';
import type { Profile } from '../types';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-1',
    name: 'Florita',
    type: 'elderly',
    avatar: '👵',
    color: '#8B6FB3',
    notes: null,
    active: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('reconcileSelectedProfileId', () => {
  it('stays null when nothing is selected', () => {
    const profiles = [makeProfile({ id: 'p1' }), makeProfile({ id: 'p2' })];
    expect(reconcileSelectedProfileId(null, profiles)).toBeNull();
  });

  it('preserves the selection when the selected profile is still in the list', () => {
    const profiles = [makeProfile({ id: 'p1' }), makeProfile({ id: 'p2' })];
    expect(reconcileSelectedProfileId('p2', profiles)).toBe('p2');
  });

  it('falls back to null once the selected profile has disappeared (e.g. soft-deleted)', () => {
    const profiles = [makeProfile({ id: 'p1' }), makeProfile({ id: 'p2' })];
    expect(reconcileSelectedProfileId('p3', profiles)).toBeNull();
  });

  it('preserves the selection when a different profile was removed', () => {
    // p2 (selected) survives; only p3 was deleted and is absent from
    // the refreshed list.
    const profiles = [makeProfile({ id: 'p1' }), makeProfile({ id: 'p2' })];
    expect(reconcileSelectedProfileId('p2', profiles)).toBe('p2');
  });

  it('falls back to null when every profile is gone', () => {
    expect(reconcileSelectedProfileId('p1', [])).toBeNull();
  });
});
