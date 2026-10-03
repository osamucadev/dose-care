import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Icon, type IconName } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import type { ProfileDayStatus } from '@/domain/occurrences';
import type { Profile } from '@/domain/types';
import { useProfileSurface } from '@/hooks/use-profile-surface';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

interface ProfileCardProps {
  profile: Profile;
  status: ProfileDayStatus;
  /** "HH:mm" of the next still-pending dose today, if any. */
  nextTime: string | null;
  onPress: () => void;
}

const HEADLINE: Record<ProfileDayStatus, { icon: IconName; label: string }> = {
  now: { icon: 'dot', label: 'Agora' },
  next: { icon: 'check', label: 'Tudo ok' },
  ok: { icon: 'check', label: 'Tudo ok' },
  none: { icon: 'minus', label: 'Nenhum cuidado hoje' },
};

export function ProfileCard({ profile, status, nextTime, onPress }: ProfileCardProps) {
  const meta = getProfileTypeMeta(profile.type);
  const surface = useProfileSurface(profile);
  const tint = useThemeColor({}, 'tint');
  const success = useThemeColor({}, 'success');
  const muted = useThemeColor({}, 'textMuted');
  const headline = HEADLINE[status];
  const headlineColor = status === 'now' ? tint : status === 'none' ? muted : success;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${profile.name}, ${headline.label}${nextTime ? `, próximo: ${nextTime}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: surface.background, borderColor: surface.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Avatar avatar={profile.avatar} tint={meta.tint} size={48} />
      <View style={styles.text}>
        <ThemedText variant="subtitle" style={styles.name}>
          {profile.name}
        </ThemedText>
        <View style={styles.status}>
          <Icon name={headline.icon} size={14} color={headlineColor} />
          <ThemedText variant="label" style={{ color: headlineColor }}>
            {headline.label}
          </ThemedText>
        </View>
        {nextTime ? <ThemedText variant="muted">Próximo: {nextTime}</ThemedText> : null}
      </View>
      <Icon name="chevron-right" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 17, lineHeight: 22 },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
