import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import { toLocalDateString } from '@/domain/datetime';
import type { DoseOccurrence } from '@/domain/types';
import { spacing } from '@/theme/tokens';

import { doseDayTimeLabel } from './dose-time';

interface NextPreviewProps {
  occurrence: DoseOccurrence;
  profileName?: string;
}

/** Compact "PRÓXIMO" preview shown right under the Agora card. May point at tomorrow. */
export function NextPreview({ occurrence, profileName }: NextPreviewProps) {
  const todayStr = toLocalDateString(new Date());

  return (
    <Card style={styles.card}>
      <ThemedText variant="label">PRÓXIMO</ThemedText>
      <View style={styles.row}>
        {profileName ? <ThemedText variant="body">{profileName}</ThemedText> : null}
        <ThemedText variant="muted">{doseDayTimeLabel(occurrence.scheduledAt, todayStr)}</ThemedText>
      </View>
      <ThemedText variant="body">
        {occurrence.medicationName}
        {occurrence.dosage ? ` · ${occurrence.dosage}` : ''}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'baseline' },
});
