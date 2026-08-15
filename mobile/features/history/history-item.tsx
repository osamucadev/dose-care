import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import type { DoseEvent } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { doseTimeLabel } from '../doses/dose-time';
import { formatHistoryDate } from './history-date';

export function HistoryItem({ event }: { event: DoseEvent }) {
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');
  const taken = event.status === 'taken';

  return (
    <View style={styles.container}>
      <ThemedText variant="subtitle">
        {event.medicationNameSnapshot}
        {event.dosageSnapshot ? ` · ${event.dosageSnapshot}` : ''}
      </ThemedText>
      <ThemedText variant="muted">
        {formatHistoryDate(event.scheduledAt)} · previsto {doseTimeLabel(event.scheduledAt)} · realizado{' '}
        {doseTimeLabel(event.occurredAt)}
      </ThemedText>
      <ThemedText variant="label" style={{ color: taken ? success : danger }}>
        {taken ? '✓ Tomado' : '× Pulado'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, paddingVertical: spacing.sm },
});
