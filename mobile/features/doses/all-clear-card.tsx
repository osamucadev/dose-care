import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

/** Shown in place of the Agora card when nothing is waiting right now. */
export function AllClearCard() {
  const success = useThemeColor({}, 'success');
  const tintSoft = useThemeColor({}, 'tintSoft');

  return (
    <Card style={styles.card}>
      <View style={[styles.bubble, { backgroundColor: tintSoft }]}>
        <Icon name="check" size={22} color={success} />
      </View>
      <ThemedText variant="subtitle" style={styles.text}>
        Tudo certo por aqui 🌿
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bubble: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
