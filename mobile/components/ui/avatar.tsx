import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import AdultAvatar from '@/assets/svg/avatars/adult.svg';
import BabyAvatar from '@/assets/svg/avatars/baby.svg';
import BirdAvatar from '@/assets/svg/avatars/bird.svg';
import CactusAvatar from '@/assets/svg/avatars/cactus.svg';
import CatAvatar from '@/assets/svg/avatars/cat.svg';
import ChildAvatar from '@/assets/svg/avatars/child.svg';
import ElderlyManAvatar from '@/assets/svg/avatars/elderly-man.svg';
import ElderlyAvatar from '@/assets/svg/avatars/elderly.svg';
import GirlAvatar from '@/assets/svg/avatars/girl.svg';
import ManAvatar from '@/assets/svg/avatars/man.svg';
import PetAvatar from '@/assets/svg/avatars/pet.svg';
import PlantAvatar from '@/assets/svg/avatars/plant.svg';
import PottedPlantAvatar from '@/assets/svg/avatars/potted-plant.svg';
import RabbitAvatar from '@/assets/svg/avatars/rabbit.svg';
import SunflowerAvatar from '@/assets/svg/avatars/sunflower.svg';
import { radius } from '@/theme/tokens';

import { ThemedText } from './themed-text';

/** Illustrated avatars, stored in `Profile.avatar` as `svg:<key>`, with a spoken label for screen readers. */
const ILLUSTRATED_AVATARS: Record<string, { Svg: FC<SvgProps>; label: string }> = {
  'svg:child': { Svg: ChildAvatar, label: 'menino' },
  'svg:girl': { Svg: GirlAvatar, label: 'menina' },
  'svg:baby': { Svg: BabyAvatar, label: 'bebê' },
  'svg:adult': { Svg: AdultAvatar, label: 'mulher' },
  'svg:man': { Svg: ManAvatar, label: 'homem' },
  'svg:elderly': { Svg: ElderlyAvatar, label: 'senhora' },
  'svg:elderly-man': { Svg: ElderlyManAvatar, label: 'senhor' },
  'svg:pet': { Svg: PetAvatar, label: 'cachorro' },
  'svg:cat': { Svg: CatAvatar, label: 'gato' },
  'svg:rabbit': { Svg: RabbitAvatar, label: 'coelho' },
  'svg:bird': { Svg: BirdAvatar, label: 'pássaro' },
  'svg:plant': { Svg: PlantAvatar, label: 'muda' },
  'svg:potted-plant': { Svg: PottedPlantAvatar, label: 'planta no vaso' },
  'svg:cactus': { Svg: CactusAvatar, label: 'cacto' },
  'svg:sunflower': { Svg: SunflowerAvatar, label: 'girassol' },
};

/** Spoken name of an avatar option, e.g. "Avatar gato". */
export function avatarAccessibilityLabel(avatar: string): string {
  return `Avatar ${ILLUSTRATED_AVATARS[avatar]?.label ?? avatar}`;
}

interface AvatarProps {
  /** An illustrated avatar key (`svg:child`, ...). */
  avatar: string;
  tint: string;
  size?: number;
}

export function Avatar({ avatar, tint, size = 48 }: AvatarProps) {
  const illustrated = ILLUSTRATED_AVATARS[avatar];

  if (illustrated) {
    // The illustration carries its own round background.
    return (
      <View
        style={{ width: size, height: size }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <illustrated.Svg width={size} height={size} />
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
