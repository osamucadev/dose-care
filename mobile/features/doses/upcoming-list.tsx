import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import type { DoseOccurrence, Profile } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

import { doseTimeLabel } from './dose-time';
import { TakeEarlyButton } from './take-early-button';
import { TimeBadge } from './time-badge';

interface UpcomingListProps {
  title: string;
  occurrences: DoseOccurrence[];
  /** Resolves each row's profile for aggregated (all-profiles) lists. */
  profilesById?: Record<string, Profile>;
  emptyLabel: string;
  /** Rows that may be taken early show "Tomar agora". */
  earlyIds?: ReadonlySet<string>;
  onTakeEarly?: (occurrence: DoseOccurrence) => void;
}

export function UpcomingList({
  title,
  occurrences,
  profilesById,
  emptyLabel,
  earlyIds,
  onTakeEarly,
}: UpcomingListProps) {
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
            const takeEarly = onTakeEarly && earlyIds?.has(occurrence.id) ? () => onTakeEarly(occurrence) : null;
            return (
              <View
                key={occurrence.id}
                style={[styles.item, index > 0 && { borderTopWidth: 1, borderTopColor: border }]}>
                <View style={styles.row}>
                {profile ? (
                  <Avatar avatar={profile.avatar} tint={getProfileTypeMeta(profile.type).tint} size={40} />
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
                {takeEarly ? <TakeEarlyButton occurrence={occurrence} onPress={takeEarly} /> : null}
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
  item: { gap: spacing.sm, paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
  empty: { paddingVertical: spacing.sm },
});
