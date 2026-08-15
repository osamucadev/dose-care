import { StyleSheet, View } from 'react-native';

import { radius } from '@/theme/tokens';

import { ThemedText } from './themed-text';

interface AvatarProps {
  emoji: string;
  tint: string;
  size?: number;
}

export function Avatar({ emoji, tint, size = 48 }: AvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: tint },
      ]}>
      <ThemedText style={{ fontSize: size * 0.5 }} accessibilityElementsHidden importantForAccessibility="no">
        {emoji}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
