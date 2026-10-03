import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import AdultAvatar from '@/assets/svg/avatars/adult.svg';
import ChildAvatar from '@/assets/svg/avatars/child.svg';
import ElderlyAvatar from '@/assets/svg/avatars/elderly.svg';
import PetAvatar from '@/assets/svg/avatars/pet.svg';
import PlantAvatar from '@/assets/svg/avatars/plant.svg';
import { radius } from '@/theme/tokens';

import { ThemedText } from './themed-text';

/** Illustrated avatars, stored in `Profile.avatar` as `svg:<key>`. */
const SVG_AVATARS: Record<string, FC<SvgProps>> = {
  'svg:child': ChildAvatar,
  'svg:adult': AdultAvatar,
  'svg:elderly': ElderlyAvatar,
  'svg:pet': PetAvatar,
  'svg:plant': PlantAvatar,
};

export function isIllustratedAvatar(avatar: string): boolean {
  return avatar in SVG_AVATARS;
}

interface AvatarProps {
  /** An emoji or an illustrated avatar key (`svg:child`, ...). */
  emoji: string;
  tint: string;
  size?: number;
}

export function Avatar({ emoji, tint, size = 48 }: AvatarProps) {
  const Illustrated = SVG_AVATARS[emoji];

  if (Illustrated) {
    // The illustration carries its own round background.
    return (
      <View
        style={{ width: size, height: size }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <Illustrated width={size} height={size} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: tint },
      ]}>
      {/* lineHeight set explicitly (and larger than fontSize): ThemedText's
          default (body) lineHeight is a fixed 21, which clips an emoji
          rendered at these larger, size-dependent fontSizes instead of
          just adding breathing room. */}
      <ThemedText
        style={{ fontSize: size * 0.5, lineHeight: size * 0.6 }}
        accessibilityElementsHidden
        importantForAccessibility="no">
        {emoji}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
