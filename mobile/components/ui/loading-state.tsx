import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { ThemedText } from './themed-text';

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={tint} />
      <ThemedText variant="muted">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
});
