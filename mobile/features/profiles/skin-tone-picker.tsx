import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import type { SkinTone } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SKIN_TONES } from '@/theme/skin-tones';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

interface SkinTonePickerProps {
  value: SkinTone;
  onChange: (tone: SkinTone) => void;
}

/** Row of skin color swatches; the selected one gets a check, not just a border. */
export function SkinTonePicker({ value, onChange }: SkinTonePickerProps) {
  const inputBorder = useThemeColor({}, 'inputBorder');
  const accent = useThemeColor({}, 'tint');

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {SKIN_TONES.map((tone) => {
        const selected = tone.value === value;
        return (
          <Pressable
            key={tone.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`Tom de pele ${tone.label}`}
            onPress={() => onChange(tone.value)}
            style={[
              styles.swatch,
              {
                backgroundColor: tone.swatch,
                borderColor: selected ? accent : inputBorder,
                borderWidth: selected ? 3 : 1.5,
              },
            ]}>
            {selected ? <Icon name="check" size={22} color={tone.checkColor} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
