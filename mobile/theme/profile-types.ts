import type { Profile, ProfileType } from '@/domain/types';

export interface ProfileTypeMeta {
  type: ProfileType;
  label: string;
  /**
   * Persisted as-is in `Profile.avatar`: an illustrated avatar key such
   * as `svg:child` (see `components/ui/avatar.tsx`). Profiles created
   * with an emoji before 1.1.0 were converted by migration 004.
   */
  defaultAvatar: string;
  avatarOptions: string[];
  /** Used sparingly: borders, badges, small accents, never large fills. */
  color: string;
  /** Very soft tint, safe as a card/badge background in both themes. */
  tint: string;
}

export const PROFILE_TYPES: ProfileTypeMeta[] = [
  {
    type: 'child',
    label: 'Criança',
    defaultAvatar: 'svg:child',
    avatarOptions: ['svg:child', 'svg:girl', 'svg:baby'],
    color: '#D49A2A',
    tint: '#FEF4D5',
  },
  {
    type: 'adult',
    label: 'Adulto',
    defaultAvatar: 'svg:adult',
    avatarOptions: ['svg:adult', 'svg:man'],
    color: '#4F86C6',
    tint: '#E6F1FE',
  },
  {
    type: 'elderly',
    label: 'Idoso',
    defaultAvatar: 'svg:elderly',
    avatarOptions: ['svg:elderly', 'svg:elderly-man'],
    color: '#8F6FBF',
    tint: '#F4E7F9',
  },
  {
    type: 'pet',
    label: 'Pet',
    defaultAvatar: 'svg:pet',
    avatarOptions: ['svg:pet', 'svg:cat', 'svg:rabbit', 'svg:bird'],
    color: '#3E9A8C',
    tint: '#E1F3E4',
  },
  {
    type: 'plant',
    label: 'Planta',
    defaultAvatar: 'svg:plant',
    avatarOptions: ['svg:plant', 'svg:potted-plant', 'svg:cactus', 'svg:sunflower'],
    color: '#5A9A5E',
    tint: '#E6F7E2',
  },
];

const BY_TYPE: Record<ProfileType, ProfileTypeMeta> = Object.fromEntries(
  PROFILE_TYPES.map((meta) => [meta.type, meta])
) as Record<ProfileType, ProfileTypeMeta>;

export function getProfileTypeMeta(type: ProfileType): ProfileTypeMeta {
  return BY_TYPE[type];
}

/**
 * Resolves the accent color to show for a profile: `Profile.color` is
 * already persisted by the create/edit form (currently always the
 * selected type's default, since there is no dedicated color picker
 * yet), so the UI must not silently ignore it and re-derive the type's
 * color instead. Falls back to the type default only if the stored
 * value is missing or blank.
 */
export function resolveProfileAccentColor(profile: Pick<Profile, 'color' | 'type'>): string {
  const stored = profile.color?.trim();
  return stored ? stored : getProfileTypeMeta(profile.type).color;
}
