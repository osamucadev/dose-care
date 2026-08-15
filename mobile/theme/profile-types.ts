import type { ProfileType } from '@/domain/types';

export interface ProfileTypeMeta {
  type: ProfileType;
  label: string;
  defaultAvatar: string;
  avatarOptions: string[];
  /** Used sparingly: borders, badges, small accents — never large fills. */
  color: string;
  /** Very soft tint, safe as a card/badge background in both themes. */
  tint: string;
}

export const PROFILE_TYPES: ProfileTypeMeta[] = [
  {
    type: 'child',
    label: 'Criança',
    defaultAvatar: '👶',
    avatarOptions: ['👶', '🧒', '👦', '👧'],
    color: '#D8A83D',
    tint: '#FBF1D8',
  },
  {
    type: 'adult',
    label: 'Adulto',
    defaultAvatar: '🧑',
    avatarOptions: ['🧑', '👨', '👩'],
    color: '#4C86A8',
    tint: '#E1EFF5',
  },
  {
    type: 'elderly',
    label: 'Idoso',
    defaultAvatar: '👵',
    avatarOptions: ['👵', '👴'],
    color: '#8B6FB3',
    tint: '#EEE6F7',
  },
  {
    type: 'pet',
    label: 'Pet',
    defaultAvatar: '🐾',
    avatarOptions: ['🐾', '🐶', '🐱', '🐰', '🐦'],
    color: '#4F9E76',
    tint: '#E1F2E9',
  },
  {
    type: 'plant',
    label: 'Planta',
    defaultAvatar: '🌿',
    avatarOptions: ['🌿', '🌱', '🪴', '🌵', '🌻'],
    color: '#5C8A4F',
    tint: '#E6F0E1',
  },
];

const BY_TYPE: Record<ProfileType, ProfileTypeMeta> = Object.fromEntries(
  PROFILE_TYPES.map((meta) => [meta.type, meta])
) as Record<ProfileType, ProfileTypeMeta>;

export function getProfileTypeMeta(type: ProfileType): ProfileTypeMeta {
  return BY_TYPE[type];
}
