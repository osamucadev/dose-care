import { toLocalDateString } from '@/domain/datetime';
import { computeNowAndNext, computeProfileDayStatus, type ProfileDayStatus } from '@/domain/occurrences';
import type { DoseOccurrence, Profile } from '@/domain/types';
import { doseDayTimeLabel } from '@/features/doses/dose-time';
import { getProfileTypeMeta } from '@/theme/profile-types';

/** How many upcoming doses the Home lists at most (SPEC §15). */
export const HOME_UPCOMING_LIMIT = 5;

export interface HomeProfileRow {
  profile: Profile;
  status: ProfileDayStatus;
  /** "HH:mm" or "amanhã · HH:mm" of the profile's next pending dose. */
  nextTime: string | null;
}

export interface HomeNowProfile {
  name: string;
  avatar: string;
  tint: string;
}

export interface HomeDosesState {
  now: DoseOccurrence | null;
  nowProfile: HomeNowProfile | null;
  next: DoseOccurrence | null;
  /** Only in the aggregated view: a filtered view already says whose doses these are. */
  nextProfile: Profile | null;
  upcomingTitle: string;
  upcoming: DoseOccurrence[];
  /** Only in the aggregated view, for the same reason as `nextProfile`. */
  upcomingProfilesById: Record<string, Profile> | undefined;
  /** One row per profile in the aggregated view; null while a single profile is selected. */
  profileRows: HomeProfileRow[] | null;
}

/**
 * Everything the Home shows about doses, derived from already-loaded
 * data. Pure, so the whole presentation logic of the Home is testable
 * without rendering: the screen only lays this out.
 */
export function buildHomeDosesState(input: {
  profiles: Profile[];
  occurrences: DoseOccurrence[];
  selectedProfileId: string | null;
  now: Date;
}): HomeDosesState {
  const { profiles, occurrences, selectedProfileId, now } = input;
  const aggregated = selectedProfileId === null;
  const profilesById: Record<string, Profile> = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const todayStr = toLocalDateString(now);

  const visible = aggregated ? occurrences : occurrences.filter((o) => o.profileId === selectedProfileId);
  const nowNext = computeNowAndNext(visible, now);

  const nowOwner = nowNext.now ? profilesById[nowNext.now.profileId] : undefined;
  const nextOwner = nowNext.next ? profilesById[nowNext.next.profileId] : undefined;

  return {
    now: nowNext.now,
    nowProfile: nowOwner
      ? { name: nowOwner.name, avatar: nowOwner.avatar, tint: getProfileTypeMeta(nowOwner.type).tint }
      : null,
    next: nowNext.next,
    nextProfile: aggregated ? (nextOwner ?? null) : null,
    upcomingTitle: aggregated ? 'Próximos' : 'Próximas doses de hoje',
    upcoming: nowNext.upcomingToday.slice(0, HOME_UPCOMING_LIMIT),
    upcomingProfilesById: aggregated ? profilesById : undefined,
    profileRows: aggregated
      ? profiles.map((profile) => {
          const own = occurrences.filter((o) => o.profileId === profile.id);
          const next = computeNowAndNext(own, now).next;
          return {
            profile,
            status: computeProfileDayStatus(own, now),
            nextTime: next ? doseDayTimeLabel(next.scheduledAt, todayStr) : null,
          };
        })
      : null,
  };
}
