import { StyleSheet, View } from 'react-native';

import RemindersIllustration from '@/assets/svg/illustrations/onboarding-reminders.svg';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { HistoryEntry } from '@/domain/history';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { HistoryItem } from './history-item';

export function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  const border = useThemeColor({}, 'border');

  if (entries.length === 0) {
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
      {entries.map((entry, index) => (
        <View key={entry.event.id} style={index > 0 ? [styles.divider, { borderTopColor: border }] : undefined}>
          <HistoryItem entry={entry} />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0, paddingVertical: spacing.xs },
  divider: { borderTopWidth: 1 },
});
