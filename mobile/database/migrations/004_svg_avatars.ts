import type { Migration } from './types';

/**
 * Every emoji the avatar picker offered before 1.1.0, mapped to the
 * illustrated avatar that replaces it.
 */
export const LEGACY_EMOJI_AVATARS: Record<string, string> = {
  '👶': 'svg:baby',
  '🧒': 'svg:child',
  '👦': 'svg:child',
  '👧': 'svg:girl',
  '🧑': 'svg:man',
  '👨': 'svg:man',
  '👩': 'svg:adult',
  '👵': 'svg:elderly',
  '👴': 'svg:elderly-man',
  '🐾': 'svg:pet',
  '🐶': 'svg:pet',
  '🐱': 'svg:cat',
  '🐰': 'svg:rabbit',
  '🐦': 'svg:bird',
  '🌿': 'svg:plant',
  '🌱': 'svg:plant',
  '🪴': 'svg:potted-plant',
  '🌵': 'svg:cactus',
  '🌻': 'svg:sunflower',
};

const emojiCases = Object.entries(LEGACY_EMOJI_AVATARS)
  .map(([emoji, key]) => `WHEN '${emoji}' THEN '${key}'`)
  .join(' ');

/**
 * Converts profiles still showing an emoji avatar to the matching
 * illustration. Only `profiles.avatar` changes, a display preference:
 * no medication or dose_event is touched. Anything that is neither a
 * known emoji nor already `svg:` falls back to its type's default
 * illustration, so no profile is left rendering a bare glyph.
 */
export const svgAvatars: Migration = {
  version: 4,
  name: 'convert_emoji_avatars_to_svg',
  up: `
    UPDATE profiles SET avatar = CASE avatar ${emojiCases} ELSE avatar END
      WHERE avatar NOT LIKE 'svg:%';
    UPDATE profiles SET avatar = CASE type
        WHEN 'child' THEN 'svg:child'
        WHEN 'adult' THEN 'svg:adult'
        WHEN 'elderly' THEN 'svg:elderly'
        WHEN 'pet' THEN 'svg:pet'
        ELSE 'svg:plant'
      END
      WHERE avatar NOT LIKE 'svg:%';
  `,
};
