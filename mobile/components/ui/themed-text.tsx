import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { fontSize } from '@/theme/tokens';

export type ThemedTextVariant = 'title' | 'subtitle' | 'body' | 'label' | 'muted' | 'link';

export type ThemedTextProps = TextProps & {
  variant?: ThemedTextVariant;
};

export function ThemedText({ style, variant = 'body', ...rest }: ThemedTextProps) {
  const color = useThemeColor({}, variant === 'muted' ? 'textMuted' : variant === 'link' ? 'tint' : 'text');

  return <Text style={[{ color }, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.xxl, fontWeight: '700', lineHeight: 32 },
  subtitle: { fontSize: fontSize.xl, fontWeight: '700', lineHeight: 26 },
  body: { fontSize: fontSize.md, lineHeight: 21 },
  label: { fontSize: fontSize.sm, fontWeight: '600', lineHeight: 18 },
  muted: { fontSize: fontSize.sm, lineHeight: 18 },
  link: { fontSize: fontSize.md, fontWeight: '600', lineHeight: 21 },
});
