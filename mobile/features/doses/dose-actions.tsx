import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { spacing } from '@/theme/tokens';

interface DoseActionsProps {
  onTaken: () => void;
  onSkip: () => void;
  busy?: boolean;
}

/** "Tomado" / "Pular" — deliberately no "Depois"/snooze in this MVP. */
export function DoseActions({ onTaken, onSkip, busy }: DoseActionsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.grow}>
        <Button label="✓ Tomado" onPress={onTaken} loading={busy} fullWidth />
      </View>
      <View style={styles.grow}>
        <Button label="× Pular" variant="secondary" onPress={onSkip} disabled={busy} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  grow: { flex: 1 },
});
