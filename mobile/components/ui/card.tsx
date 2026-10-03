import { StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, shadow, spacing } from '@/theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  return <View style={[styles.card, { backgroundColor, borderColor }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow,
  },
});
