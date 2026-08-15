import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ThemedText } from '@/components/ui/themed-text';
import type { Profile } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function ProfileSelector({ profiles, selectedId, onSelect }: ProfileSelectorProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip
        label="Todos"
        selected={selectedId === null}
        onPress={() => onSelect(null)}
        surface={surface}
        border={border}
        tint={tint}
      />
      {profiles.map((profile) => {
        const meta = getProfileTypeMeta(profile.type);
        const selected = selectedId === profile.id;
        return (
          <Pressable
            key={profile.id}
            accessibilityRole="button"
            accessibilityLabel={profile.name}
            accessibilityState={{ selected }}
            onPress={() => onSelect(profile.id)}
            style={[
              styles.profileChip,
              { backgroundColor: selected ? meta.tint : surface, borderColor: selected ? meta.color : border },
            ]}>
            <Avatar emoji={profile.avatar} tint={meta.tint} size={28} />
            <ThemedText variant="label">{profile.name}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
  surface,
  border,
  tint,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  surface: string;
  border: string;
  tint: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? tint : surface, borderColor: selected ? tint : border },
      ]}>
      <ThemedText variant="label" style={{ color: selected ? '#FFFFFF' : undefined }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1.5,
  },
});
