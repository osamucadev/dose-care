import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

/** The soft, warm pill that shows a dose's time at the end of a row. */
export function TimeBadge({ label }: { label: string }) {
  const warmSoft = useThemeColor({}, 'warmSoft');

  return (
    <View style={[styles.badge, { backgroundColor: warmSoft }]}>
      <ThemedText variant="label" style={styles.text}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  text: { fontSize: 15 },
});
