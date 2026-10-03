import type { Profile } from '@/domain/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta, resolveProfileAccentColor } from '@/theme/profile-types';

/**
 * Background and border for a surface that represents a profile (cards,
 * selected chips). In light mode it uses the type's pastel tint, as in
 * the prototype. In dark mode those pastels would sit under light text
 * and become unreadable, so it falls back to the regular surface and
 * keeps the profile's identity in the accent border only.
 */
export function useProfileSurface(profile: Pick<Profile, 'type' | 'color'>): {
  background: string;
  border: string;
} {
  const scheme = useColorScheme() ?? 'light';
  const surface = useThemeColor({}, 'surface');
  const accent = resolveProfileAccentColor(profile);

  if (scheme === 'dark') return { background: surface, border: accent };
  const tint = getProfileTypeMeta(profile.type).tint;
  return { background: tint, border: tint };
}
