import { StyleSheet, View } from 'react-native';

import { AVATAR_ART } from '@/assets/svg/avatars';
import type { SkinTone } from '@/domain/types';
import { radius } from '@/theme/tokens';

import { ThemedText } from './themed-text';

/**
 * Spoken labels of the illustrated avatars, stored in `Profile.avatar`
 * as `svg:<key>`. The art itself is generated (`AVATAR_ART`).
 */
const AVATAR_LABELS: Record<string, string> = {
  'svg:child': 'menino',
  'svg:girl': 'menina',
  'svg:baby': 'bebê',
  'svg:adult': 'mulher',
  'svg:man': 'homem',
  'svg:elderly': 'senhora',
  'svg:elderly-man': 'senhor',
  'svg:pet': 'cachorro',
  'svg:labrador': 'labrador',
  'svg:husky': 'husky',
  'svg:boxer': 'boxer',
  'svg:caramelo': 'vira-lata caramelo',
  'svg:cat': 'gato laranja',
  'svg:black-cat': 'gato preto',
  'svg:white-cat': 'gato branco',
  'svg:tricolor-cat': 'gato tricolor',
  'svg:rabbit': 'coelho',
  'svg:bird': 'pássaro',
  'svg:fish': 'peixe',
  'svg:hamster': 'hamster',
  'svg:turtle': 'tartaruga',
  'svg:lizard': 'lagarto',
  'svg:snake': 'cobra',
  'svg:robot': 'robô',
  'svg:plant': 'muda',
  'svg:potted-plant': 'planta no vaso',
  'svg:cactus': 'cacto',
  'svg:sunflower': 'girassol',
  'svg:succulent': 'suculenta',
  'svg:orchid': 'orquídea',
  'svg:fern': 'samambaia',
};

/** Spoken name of an avatar option, e.g. "Avatar gato". */
export function avatarAccessibilityLabel(avatar: string): string {
  return `Avatar ${AVATAR_LABELS[avatar] ?? avatar}`;
}

interface AvatarProps {
  /** An illustrated avatar key (`svg:child`, ...). */
  avatar: string;
  /** Picks the art of people avatars; the others ignore it. */
  skinTone: SkinTone;
  tint: string;
  size?: number;
}

export function Avatar({ avatar, skinTone, tint, size = 48 }: AvatarProps) {
  const art = AVATAR_ART[avatar];
  const Svg = typeof art === 'object' ? art[skinTone] : art;

  if (Svg) {
    // The illustration carries its own round background.
    return (
      <View
        style={{ width: size, height: size }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <Svg width={size} height={size} />
      </View>
    );
  }

  // Safety net for a value migration 004 did not know about: render it
  // as text rather than show nothing.
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: tint },
      ]}>
      {/* lineHeight set explicitly (and larger than fontSize): ThemedText's
          default (body) lineHeight is a fixed 21, which clips a glyph
          rendered at these larger, size-dependent fontSizes instead of
          just adding breathing room. */}
      <ThemedText
        style={{ fontSize: size * 0.5, lineHeight: size * 0.6 }}
        accessibilityElementsHidden
        importantForAccessibility="no">
        {avatar}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
