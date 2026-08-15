import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';

import { Button } from './button';
import { ThemedText } from './themed-text';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Gentle, welcoming empty state — never phrased as a warning or failure. */
export function EmptyState({ emoji = '🌿', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
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
  // lineHeight must be set explicitly and generously here: ThemedText's
  // default (body) lineHeight is 21, far shorter than an emoji glyph
  // rendered at fontSize 40 needs, so without this the emoji gets
  // clipped top/bottom instead of the extra size just adding padding.
  emoji: { fontSize: 40, lineHeight: 48 },
  center: { textAlign: 'center' },
});
