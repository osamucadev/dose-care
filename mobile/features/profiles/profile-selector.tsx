import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ThemedText } from '@/components/ui/themed-text';
import type { Profile } from '@/domain/types';
import { useProfileSurface } from '@/hooks/use-profile-surface';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { radius, spacing } from '@/theme/tokens';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Horizontal "Todos / profile" filter. The selected chip is always the
 * solid teal one, whatever its profile type, and also exposes
 * `accessibilityState.selected`, so selection never relies on a pastel
 * difference alone.
 */
export function ProfileSelector({ profiles, selectedId, onSelect }: ProfileSelectorProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const allSelected = selectedId === null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Todos"
        accessibilityState={{ selected: allSelected }}
        onPress={() => onSelect(null)}
        style={[
          styles.chip,
          styles.allChip,
          { backgroundColor: allSelected ? tint : surface, borderColor: allSelected ? tint : border },
        ]}>
        <ThemedText variant="label" style={{ color: allSelected ? onTint : undefined }}>
          Todos
        </ThemedText>
      </Pressable>
      {profiles.map((profile) => (
        <ProfileChip
          key={profile.id}
          profile={profile}
          selected={selectedId === profile.id}
          onPress={() => onSelect(profile.id)}
        />
      ))}
    </ScrollView>
  );
}

function ProfileChip({ profile, selected, onPress }: { profile: Profile; selected: boolean; onPress: () => void }) {
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const idle = useProfileSurface(profile);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={profile.name}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        styles.profileChip,
        {
          backgroundColor: selected ? tint : idle.background,
          borderColor: selected ? tint : idle.border,
        },
      ]}>
      <Avatar emoji={profile.avatar} tint={getProfileTypeMeta(profile.type).tint} size={30} />
      <ThemedText variant="label" style={{ color: selected ? onTint : undefined }}>
        {profile.name}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  allChip: { paddingHorizontal: spacing.lg },
  profileChip: { gap: spacing.xs, paddingLeft: spacing.xs, paddingRight: spacing.md },
});
