import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';

import { Button } from './button';
import { ThemedText } from './themed-text';

export function ErrorState({
  message = 'Não foi possível carregar os dados agora.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ThemedText variant="body">{message}</ThemedText>
      {onRetry ? <Button label="Tentar novamente" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
});
