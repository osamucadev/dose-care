import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
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

/** The main "AGORA" hero card — the single most urgent pending dose. */
export function NowCard({ occurrence, profileName, profileAvatar, profileTint, onTaken, onSkip, busy }: NowCardProps) {
  const tint = useThemeColor({}, 'tint');

  return (
    <Card style={styles.card}>
      <ThemedText variant="label" style={{ color: tint }}>
        AGORA · {doseTimeLabel(occurrence.scheduledAt)}
      </ThemedText>

      <View style={styles.headerRow}>
        {profileAvatar ? <Avatar emoji={profileAvatar} tint={profileTint ?? tint} size={40} /> : null}
        <View style={styles.headerText}>
          {profileName ? <ThemedText variant="subtitle">{profileName}</ThemedText> : null}
          <ThemedText variant="body">
            {occurrence.medicationName}
            {occurrence.dosage ? ` · ${occurrence.dosage}` : ''}
          </ThemedText>
        </View>
      </View>

      <DoseActions onTaken={onTaken} onSkip={onSkip} busy={busy} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { gap: 2, flexShrink: 1 },
});
