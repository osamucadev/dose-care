import type { DoseOccurrence, Profile } from '@/domain/types';

import { buildHomeDosesState, buildRestockRows, HOME_UPCOMING_LIMIT, upcomingEmptyLabel } from '../home-view-state';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'florita',
    name: 'Florita',
    type: 'elderly',
    avatar: 'svg:elderly',
    color: '#8F6FBF',
    notes: null,
    active: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeOccurrence(profileId: string, scheduledAt: string, overrides: Partial<DoseOccurrence> = {}): DoseOccurrence {
  return {
    id: `${profileId}_${scheduledAt}`,
    profileId,
    medicationId: `med-${profileId}`,
    medicationName: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: null,
    scheduledAt,
    status: 'pending',
    event: null,
    ...overrides,
  };
}

const florita = makeProfile();
const nino = makeProfile({ id: 'nino', name: 'Nino', type: 'pet', avatar: 'svg:pet' });
const NOW = new Date(2026, 7, 15, 9, 0);

describe('buildHomeDosesState, aggregated view', () => {
  const occurrences = [
    makeOccurrence('florita', '2026-08-15T08:00'),
    makeOccurrence('nino', '2026-08-15T12:00'),
    makeOccurrence('florita', '2026-08-15T20:00'),
  ];
  const state = buildHomeDosesState({ profiles: [florita, nino], occurrences, selectedProfileId: null, now: NOW });

  it('shows the due dose as Agora with its owner', () => {
    expect(state.now?.scheduledAt).toBe('2026-08-15T08:00');
    expect(state.nowProfile).toEqual({ name: 'Florita', avatar: 'svg:elderly', tint: expect.any(String) });
  });

  it('shows Próximo with its owner', () => {
    expect(state.next?.scheduledAt).toBe('2026-08-15T12:00');
    expect(state.nextProfile?.name).toBe('Nino');
  });

  it('lists the rest under "Próximos" with owners resolvable', () => {
    expect(state.upcomingTitle).toBe('Próximos');
    expect(state.upcoming.map((o) => o.scheduledAt)).toEqual(['2026-08-15T20:00']);
    expect(state.upcomingProfilesById?.florita).toBe(florita);
  });

  it('builds one row per profile with status and next time', () => {
    expect(state.profileRows).toEqual([
      { profile: florita, status: 'now', nextTime: '20:00' },
      { profile: nino, status: 'next', nextTime: '12:00' },
    ]);
  });
});

describe('buildHomeDosesState, single profile selected', () => {
  const occurrences = [makeOccurrence('florita', '2026-08-15T20:00'), makeOccurrence('nino', '2026-08-15T12:00')];
  const state = buildHomeDosesState({ profiles: [florita, nino], occurrences, selectedProfileId: 'florita', now: NOW });

  it('only considers the selected profile doses', () => {
    expect(state.now).toBeNull();
    expect(state.next?.profileId).toBe('florita');
  });

  it('does not repeat whose dose it is, and hides the per-profile rows', () => {
    expect(state.nextProfile).toBeNull();
    expect(state.upcomingProfilesById).toBeUndefined();
    expect(state.upcomingTitle).toBe('Próximas doses de hoje');
    expect(state.profileRows).toBeNull();
  });
});

describe('buildHomeDosesState, limits and labels', () => {
  it(`caps the upcoming list at ${HOME_UPCOMING_LIMIT}`, () => {
    const occurrences = ['10', '11', '12', '13', '14', '15', '16', '17'].map((h) =>
      makeOccurrence('florita', `2026-08-15T${h}:00`)
    );
    const state = buildHomeDosesState({ profiles: [florita], occurrences, selectedProfileId: null, now: NOW });
    // 10:00 is Próximo; the list starts after it.
    expect(state.upcoming).toHaveLength(HOME_UPCOMING_LIMIT);
    expect(state.upcoming[0].scheduledAt).toBe('2026-08-15T11:00');
  });

  it('labels a next dose that falls tomorrow', () => {
    const occurrences = [makeOccurrence('florita', '2026-08-16T08:00')];
    const state = buildHomeDosesState({ profiles: [florita], occurrences, selectedProfileId: null, now: NOW });
    expect(state.profileRows?.[0].nextTime).toBe('amanhã · 08:00');
  });

  it('reports "none" for a profile without doses', () => {
    const state = buildHomeDosesState({ profiles: [florita], occurrences: [], selectedProfileId: null, now: NOW });
    expect(state.profileRows).toEqual([{ profile: florita, status: 'none', nextTime: null }]);
  });
});

describe('buildRestockRows', () => {
  const status = (remaining: number, base = 30) => ({ base, remaining, level: 'low' as const, daysLeft: remaining });
  const items = [
    { medicationId: 'm1', profileId: 'florita', medicationName: 'Losartana', dosage: '50 mg', status: status(3) },
    { medicationId: 'm2', profileId: 'nino', medicationName: 'Ração', dosage: null, status: status(1) },
    { medicationId: 'm3', profileId: 'gone', medicationName: 'Outro', dosage: null, status: status(0) },
  ];

  it('lists the closest to running out first, with a readable label, dropping unlisted profiles', () => {
    const rows = buildRestockRows(items, [florita, nino], null);
    expect(rows.map((r) => [r.medicationLabel, r.profile.name])).toEqual([
      ['Ração', 'Nino'],
      ['Losartana 50 mg', 'Florita'],
    ]);
  });

  it('only shows the selected profile', () => {
    expect(buildRestockRows(items, [florita, nino], 'florita').map((r) => r.medicationId)).toEqual(['m1']);
  });
});

describe('upcomingEmptyLabel', () => {
  const today = '2026-08-15';

  it('says all is fine when nothing is pending today', () => {
    expect(upcomingEmptyLabel(null, null, today)).toBe('Por hoje está tudo certo!');
    expect(upcomingEmptyLabel(null, makeOccurrence('florita', '2026-08-16T08:00'), today)).toBe(
      'Por hoje está tudo certo!'
    );
  });

  it('does not say all is fine while a dose waits in Agora', () => {
    expect(upcomingEmptyLabel(makeOccurrence('florita', '2026-08-15T08:00'), null, today)).toBe(
      'Nenhuma outra dose para hoje.'
    );
  });

  it('does not say all is fine while Próximo is still today', () => {
    expect(upcomingEmptyLabel(null, makeOccurrence('florita', '2026-08-15T20:00'), today)).toBe(
      'Nenhuma outra dose para hoje.'
    );
  });

  it('reaches the Home state', () => {
    const state = buildHomeDosesState({ profiles: [florita], occurrences: [], selectedProfileId: null, now: NOW });
    expect(state.upcomingEmptyLabel).toBe('Por hoje está tudo certo!');
  });
});
