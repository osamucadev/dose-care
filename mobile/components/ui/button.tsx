import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

import { Icon, type IconName } from './icon';
import { ThemedText } from './themed-text';

/**
 * - `primary`: filled teal, the one main action of a block.
 * - `secondary`: outlined, for alternatives next to a primary action.
 * - `soft`: soft teal fill, for "add" style actions that sit in a list.
 * - `ghost`: text only.
 * - `destructive`: outlined in the danger color.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'destructive';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  /** Leading icon. Decorative: the label stays the accessible name. */
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ label, variant = 'primary', icon, loading, fullWidth, disabled, ...rest }: ButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const tintSoft = useThemeColor({}, 'tintSoft');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const danger = useThemeColor({}, 'danger');

  const isDisabled = disabled || loading;

  const palette: Record<ButtonVariant, { background: string; border: string; label: string }> = {
    primary: { background: tint, border: tint, label: onTint },
    secondary: { background: surface, border, label: text },
    soft: { background: tintSoft, border: tintSoft, label: tint },
    ghost: { background: 'transparent', border: 'transparent', label: tint },
    destructive: { background: surface, border: danger, label: danger },
  };
  const colors = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: variant === 'ghost' ? 0 : 1,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors.label} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={18} color={colors.label} /> : null}
          <ThemedText variant="label" style={[styles.label, { color: colors.label }]}>
            {label}
          </ThemedText>
        </View>
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
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontSize: 15 },
});
