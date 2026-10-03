import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import type { DoseOccurrence } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';

import { DoseActions } from './dose-actions';
import { doseTimeLabel } from './dose-time';

interface NowCardProps {
  occurrence: DoseOccurrence;
  profileName?: string;
  profileAvatar?: string;
  profileTint?: string;
  onTaken: () => void;
  onSkip: () => void;
  busy?: boolean;
}

/**
 * The main "AGORA" hero card: the single most urgent pending dose.
 * Deliberately calm (soft teal, not red): a dose waiting here is
 * something to do, never something the user failed at.
 */
export function NowCard({ occurrence, profileName, profileAvatar, profileTint, onTaken, onSkip, busy }: NowCardProps) {
  const tint = useThemeColor({}, 'tint');
  const tintSoft = useThemeColor({}, 'tintSoft');

  return (
    <Card style={[styles.card, { backgroundColor: tintSoft, borderColor: tintSoft }]}>
      <View style={styles.labelRow}>
        <Icon name="clock" size={16} color={tint} />
        <ThemedText variant="label" style={{ color: tint }}>
          AGORA · {doseTimeLabel(occurrence.scheduledAt)}
        </ThemedText>
      </View>

      <View style={styles.headerRow}>
        {profileAvatar ? <Avatar avatar={profileAvatar} tint={profileTint ?? tint} size={52} /> : null}
        <View style={styles.headerText}>
          {profileName ? <ThemedText variant="subtitle">{profileName}</ThemedText> : null}
          <ThemedText variant={profileName ? 'body' : 'subtitle'}>
            {occurrence.medicationName}
            {occurrence.dosage ? ` ${occurrence.dosage}` : ''}
          </ThemedText>
          {occurrence.quantityPerDose ? (
            <ThemedText variant="muted">{occurrence.quantityPerDose}</ThemedText>
          ) : null}
        </View>
      </View>

      <DoseActions onTaken={onTaken} onSkip={onSkip} busy={busy} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { gap: 2, flexShrink: 1 },
});
