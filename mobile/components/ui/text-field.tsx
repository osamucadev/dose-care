import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

import { ThemedText } from './themed-text';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, required, style, ...rest }, ref) => {
    const text = useThemeColor({}, 'text');
    const border = useThemeColor({}, error ? 'danger' : 'border');
    const surface = useThemeColor({}, 'surface');
    const muted = useThemeColor({}, 'textMuted');

    return (
      <View style={styles.container}>
        <ThemedText variant="label">
          {label}
          {required ? ' *' : ''}
        </ThemedText>
        <TextInput
          ref={ref}
          style={[styles.input, { color: text, borderColor: border, backgroundColor: surface }, style]}
          placeholderTextColor={muted}
          accessibilityLabel={label}
          {...rest}
        />
        {error ? (
          <ThemedText variant="muted" style={{ color: border }}>
            {error}
          </ThemedText>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
});
