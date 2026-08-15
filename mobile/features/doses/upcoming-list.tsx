import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import type { DoseOccurrence } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { doseTimeLabel } from './dose-time';

interface UpcomingListProps {
  title: string;
  occurrences: DoseOccurrence[];
  /** Resolves a profile's display name for aggregated (all-profiles) lists. */
  profileNameById?: Record<string, string>;
  emptyLabel: string;
}

export function UpcomingList({ title, occurrences, profileNameById, emptyLabel }: UpcomingListProps) {
  const border = useThemeColor({}, 'border');

  return (
    <Card style={styles.card}>
      <ThemedText variant="subtitle">{title}</ThemedText>
      {occurrences.length === 0 ? (
        <ThemedText variant="muted">{emptyLabel}</ThemedText>
      ) : (
        occurrences.map((occurrence, index) => (
          <View
            key={occurrence.id}
            style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: border }]}>
            <ThemedText variant="label" style={styles.time}>
              {doseTimeLabel(occurrence.scheduledAt)}
            </ThemedText>
            <ThemedText variant="body" style={styles.grow}>
              {profileNameById?.[occurrence.profileId] ? `${profileNameById[occurrence.profileId]} · ` : ''}
              {occurrence.medicationName}
              {occurrence.dosage ? ` · ${occurrence.dosage}` : ''}
            </ThemedText>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  time: { width: 48 },
  grow: { flexShrink: 1 },
});
