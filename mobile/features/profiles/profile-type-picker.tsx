import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/tokens';
import { PROFILE_TYPES } from '@/theme/profile-types';
import type { ProfileType } from '@/domain/types';

interface ProfileTypePickerProps {
  value: ProfileType;
  onChange: (type: ProfileType) => void;
}

export function ProfileTypePicker({ value, onChange }: ProfileTypePickerProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {PROFILE_TYPES.map((meta) => {
        const selected = meta.type === value;
        return (
          <Pressable
            key={meta.type}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={meta.label}
            onPress={() => onChange(meta.type)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? meta.tint : surface,
                borderColor: selected ? meta.color : border,
              },
            ]}>
            <ThemedText>{meta.defaultAvatar}</ThemedText>
            <ThemedText variant="label">{meta.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1.5,
  },
});
