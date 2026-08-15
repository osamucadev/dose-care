import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

import { ThemedText } from './themed-text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ label, variant = 'primary', loading, fullWidth, disabled, ...rest }: ButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  const isDisabled = disabled || loading;

  const backgroundColor = variant === 'primary' ? tint : variant === 'secondary' ? surface : 'transparent';
  const borderColor = variant === 'primary' ? tint : border;
  const labelColor = variant === 'primary' ? '#FFFFFF' : text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'ghost' ? 0 : 1,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <ThemedText variant="label" style={{ color: labelColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
});
