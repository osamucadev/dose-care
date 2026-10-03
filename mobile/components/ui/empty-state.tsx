import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

import { Button } from './button';
import { Icon } from './icon';
import { ThemedText } from './themed-text';

interface EmptyStateProps {
  /** An illustration from assets/svg/illustrations; without one, a small leaf mark is shown. */
  illustration?: FC<SvgProps>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Gentle, welcoming empty state, never phrased as a warning or failure. */
export function EmptyState({ illustration: Illustration, title, description, actionLabel, onAction }: EmptyStateProps) {
  const tint = useThemeColor({}, 'tint');
  const tintSoft = useThemeColor({}, 'tintSoft');

  return (
    <View style={styles.container}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Illustration ? (
          <Illustration width={240} height={180} />
        ) : (
          <View style={[styles.mark, { backgroundColor: tintSoft }]}>
            <Icon name="leaf" size={28} color={tint} />
          </View>
        )}
      </View>
      <ThemedText variant="subtitle" style={styles.center}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText variant="muted" style={styles.center}>
          {description}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  mark: { width: 64, height: 64, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
