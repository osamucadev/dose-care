import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import type { DoseEvent } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';

import { HistoryItem } from './history-item';

export function HistoryList({ events }: { events: DoseEvent[] }) {
  const border = useThemeColor({}, 'border');

  if (events.length === 0) {
    return (
      <EmptyState
        emoji="📖"
        title="Ainda não há histórico"
        description="Assim que uma dose for registrada, ela aparecerá aqui."
      />
    );
  }

  return (
    <View>
      {events.map((event, index) => (
        <View key={event.id} style={index > 0 ? [styles.divider, { borderTopColor: border }] : undefined}>
          <HistoryItem event={event} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { borderTopWidth: 1 },
});
