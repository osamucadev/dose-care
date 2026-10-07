import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import { toLocalDateString } from '@/domain/datetime';
import type { DoseOccurrence, Profile } from '@/domain/types';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

import { doseDayTimeLabel } from './dose-time';
import { TakeEarlyButton } from './take-early-button';
import { TimeBadge } from './time-badge';

interface NextPreviewProps {
  occurrence: DoseOccurrence;
  /** Shown in the aggregated (all-profiles) view only. */
  profile?: Profile;
  /** Set only when this dose may be taken early ("Tomar agora"). */
  onTakeEarly?: () => void;
}

/** Compact "PRÓXIMO" preview shown right under the Agora card. May point at tomorrow. */
export function NextPreview({ occurrence, profile, onTakeEarly }: NextPreviewProps) {
  const todayStr = toLocalDateString(new Date());

  return (
    <Card style={styles.card}>
      <ThemedText variant="label">PRÓXIMO</ThemedText>
      <View style={styles.row}>
        {profile ? (
          <Avatar avatar={profile.avatar} skinTone={profile.skinTone} tint={getProfileTypeMeta(profile.type).tint} size={40} />
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
        <TimeBadge label={doseDayTimeLabel(occurrence.scheduledAt, todayStr)} />
      </View>
      {onTakeEarly ? <TakeEarlyButton occurrence={occurrence} onPress={onTakeEarly} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
});
