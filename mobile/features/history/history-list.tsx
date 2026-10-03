import { StyleSheet, View } from 'react-native';

import RemindersIllustration from '@/assets/svg/illustrations/onboarding-reminders.svg';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { DoseEvent } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { HistoryItem } from './history-item';

export function HistoryList({ events }: { events: DoseEvent[] }) {
  const border = useThemeColor({}, 'border');

  if (events.length === 0) {
    return (
      <EmptyState
        illustration={RemindersIllustration}
        title="Ainda não há histórico"
        description="Assim que uma dose for registrada, ela aparecerá aqui."
      />
    );
  }

  return (
    <Card style={styles.card}>
      {events.map((event, index) => (
        <View key={event.id} style={index > 0 ? [styles.divider, { borderTopColor: border }] : undefined}>
          <HistoryItem event={event} />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0, paddingVertical: spacing.xs },
  divider: { borderTopWidth: 1 },
});
