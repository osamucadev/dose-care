import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import { formatUtcIsoToLocalTime } from '@/domain/datetime';
import type { HistoryEntry } from '@/domain/history';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { doseTimeLabel } from '../doses/dose-time';
import { formatHistoryDate } from './history-date';

export function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const { event, medicationName, recordedAsName, takenEarly } = entry;
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');
  const taken = event.status === 'taken';

  return (
    <View style={styles.container}>
      <ThemedText variant="subtitle" style={styles.name}>
        {medicationName}
        {event.dosageSnapshot ? ` · ${event.dosageSnapshot}` : ''}
      </ThemedText>
      {/* The stored name stays visible after a rename: history is shown
          with the current name, never silently rewritten. */}
      {recordedAsName ? <ThemedText variant="muted">Registrado como {recordedAsName}</ThemedText> : null}
      <ThemedText variant="muted">
        {/* scheduledAt is already local civil time; occurredAt is stored as
            a UTC instant and must be converted for display. */}
        {formatHistoryDate(event.scheduledAt)} · previsto {doseTimeLabel(event.scheduledAt)} · realizado{' '}
        {formatUtcIsoToLocalTime(event.occurredAt)}
      </ThemedText>
      <View style={styles.status}>
        <Icon name={taken ? 'check-circle' : 'close'} size={18} color={taken ? success : danger} />
        <ThemedText variant="label" style={{ color: taken ? success : danger }}>
          {taken ? (takenEarly ? 'Tomado antes do horário' : 'Tomado') : 'Pulado'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, paddingVertical: spacing.md },
  name: { fontSize: 17, lineHeight: 22 },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
