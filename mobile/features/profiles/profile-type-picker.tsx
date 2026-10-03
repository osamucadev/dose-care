import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import type { ProfileType } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PROFILE_TYPES } from '@/theme/profile-types';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

interface ProfileTypePickerProps {
  value: ProfileType;
  onChange: (type: ProfileType) => void;
}

/** Vertical list of profile types; the selected row gets a soft fill, a border and a check. */
export function ProfileTypePicker({ value, onChange }: ProfileTypePickerProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const tintSoft = useThemeColor({}, 'tintSoft');

  return (
    <View style={[styles.list, { backgroundColor: surface, borderColor: border }]} accessibilityRole="radiogroup">
      {PROFILE_TYPES.map((meta, index) => {
        const selected = meta.type === value;
        return (
          <Pressable
            key={meta.type}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={meta.label}
            onPress={() => onChange(meta.type)}
            style={[
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: border },
              selected && { backgroundColor: tintSoft },
            ]}>
            <Avatar emoji={meta.defaultAvatar} tint={meta.tint} size={32} />
            <ThemedText variant="body" style={[styles.label, selected && styles.selectedLabel]}>
              {meta.label}
            </ThemedText>
            {selected ? <Icon name="check" size={20} color={tint} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: { flex: 1 },
  selectedLabel: { fontWeight: '600' },
});
