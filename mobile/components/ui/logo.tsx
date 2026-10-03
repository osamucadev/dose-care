import { StyleSheet, View } from 'react-native';

import LogoMark from '@/assets/svg/brand/logo-mark.svg';
import { fontSize, spacing } from '@/theme/tokens';

import { ThemedText } from './themed-text';

/** Logo mark + "DoseCare" wordmark, used as the Home header title. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="DoseCare">
      <LogoMark width={size} height={size} />
      <ThemedText style={styles.wordmark}>DoseCare</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wordmark: { fontSize: fontSize.xl, fontWeight: '700', lineHeight: 26 },
});
