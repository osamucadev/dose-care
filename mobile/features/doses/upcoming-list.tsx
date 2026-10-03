import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import type { DoseOccurrence, Profile } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

import { doseTimeLabel } from './dose-time';
import { TimeBadge } from './time-badge';

interface UpcomingListProps {
  title: string;
  occurrences: DoseOccurrence[];
  /** Resolves each row's profile for aggregated (all-profiles) lists. */
  profilesById?: Record<string, Profile>;
  emptyLabel: string;
}

export function UpcomingList({ title, occurrences, profilesById, emptyLabel }: UpcomingListProps) {
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.section}>
      <ThemedText variant="subtitle">{title}</ThemedText>
      <Card style={styles.card}>
        {occurrences.length === 0 ? (
          <ThemedText variant="muted" style={styles.empty}>
            {emptyLabel}
          </ThemedText>
        ) : (
          occurrences.map((occurrence, index) => {
            const profile = profilesById?.[occurrence.profileId];
            return (
              <View
                key={occurrence.id}
                style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: border }]}>
                {profile ? (
                  <Avatar emoji={profile.avatar} tint={getProfileTypeMeta(profile.type).tint} size={40} />
                ) : null}
                <View style={styles.text}>
                  {profile ? <ThemedText variant="label">{profile.name}</ThemedText> : null}
                  <ThemedText variant="body">
                    {occurrence.medicationName}
                    {occurrence.dosage ? ` ${occurrence.dosage}` : ''}
                  </ThemedText>
                  {occurrence.quantityPerDose ? (
                    <ThemedText variant="muted">{occurrence.quantityPerDose}</ThemedText>
                  ) : null}
                </View>
                <TimeBadge label={doseTimeLabel(occurrence.scheduledAt)} />
              </View>
            );
          })
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  card: { gap: 0, paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  text: { flex: 1, gap: 2 },
  empty: { paddingVertical: spacing.sm },
});
