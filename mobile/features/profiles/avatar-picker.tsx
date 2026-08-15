import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

interface AvatarPickerProps {
  options: string[];
  value: string;
  onChange: (emoji: string) => void;
  tint: string;
}

export function AvatarPicker({ options, value, onChange, tint }: AvatarPickerProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((emoji) => {
        const selected = emoji === value;
        return (
          <Pressable
            key={emoji}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`Avatar ${emoji}`}
            onPress={() => onChange(emoji)}
            style={[
              styles.option,
              { backgroundColor: selected ? tint : surface, borderColor: selected ? tint : border },
            ]}>
            <ThemedText style={styles.emoji}>{emoji}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // lineHeight explicit and larger than fontSize: ThemedText's default
  // (body) lineHeight is 21, shorter than this emoji's fontSize, which
  // clips it instead of just adding breathing room.
  emoji: { fontSize: 24, lineHeight: 28 },
});
