import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, isIllustratedAvatar } from '@/components/ui/avatar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

interface AvatarPickerProps {
  options: string[];
  value: string;
  onChange: (avatar: string) => void;
  tint: string;
}

export function AvatarPicker({ options, value, onChange, tint }: AvatarPickerProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'tint');

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((avatar) => {
        const selected = avatar === value;
        return (
          <Pressable
            key={avatar}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={isIllustratedAvatar(avatar) ? 'Avatar ilustrado' : `Avatar ${avatar}`}
            onPress={() => onChange(avatar)}
            style={[
              styles.option,
              {
                backgroundColor: selected ? tint : surface,
                borderColor: selected ? accent : border,
                borderWidth: selected ? 2.5 : 1.5,
              },
            ]}>
            <Avatar emoji={avatar} tint="transparent" size={40} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
