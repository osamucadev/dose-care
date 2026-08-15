import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import type { ProfileDayStatus } from '@/domain/occurrences';
import type { Profile } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';

interface ProfileCardProps {
  profile: Profile;
  status: ProfileDayStatus;
  /** "HH:mm" of the next still-pending dose today, if any. */
  nextTime: string | null;
  onPress: () => void;
}

const HEADLINE: Record<ProfileDayStatus, { symbol: string; label: string }> = {
  now: { symbol: '●', label: 'Agora' },
  next: { symbol: '✓', label: 'Tudo ok' },
  ok: { symbol: '✓', label: 'Tudo ok' },
  none: { symbol: '·', label: 'Nenhum cuidado hoje' },
};

export function ProfileCard({ profile, status, nextTime, onPress }: ProfileCardProps) {
  const meta = getProfileTypeMeta(profile.type);
  const tint = useThemeColor({}, 'tint');
  const success = useThemeColor({}, 'success');
  const muted = useThemeColor({}, 'textMuted');
  const headline = HEADLINE[status];
  const headlineColor = status === 'now' ? tint : status === 'none' ? muted : success;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${profile.name}, ${headline.label}${nextTime ? `, próximo às ${nextTime}` : ''}`}
      onPress={onPress}
      style={styles.pressable}>
      <Card style={styles.card}>
        <Avatar emoji={profile.avatar} tint={meta.tint} size={44} />
        <ThemedText variant="subtitle">{profile.name}</ThemedText>
        <View style={styles.statusRow}>
          <ThemedText variant="label" style={{ color: headlineColor }}>
            {headline.symbol} {headline.label}
          </ThemedText>
        </View>
        {nextTime ? <ThemedText variant="muted">Próximo: {nextTime}</ThemedText> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { minWidth: 150, flexGrow: 1, flexBasis: '45%' },
  card: { alignItems: 'flex-start' },
  statusRow: { flexDirection: 'row' },
});
