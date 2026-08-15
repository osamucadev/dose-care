import { Pressable, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';

import { ThemedText } from './themed-text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: [SegmentedOption<T>, SegmentedOption<T>, ...SegmentedOption<T>[]];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

/**
 * A tab-like control built from plain `Pressable`/`View` — no new
 * dependency, no global tab bar. Selection is never signaled by color
 * alone: the selected segment also gets a filled background *and* a
 * "✓" prefix on its label, and `accessibilityRole`/`accessibilityState`
 * carry the same information to screen readers.
 *
 * Tapping the already-selected segment is guaranteed to be a no-op —
 * `onChange` simply isn't called — so screens can wire their "same
 * tab" callback however they like (including navigation) without
 * worrying about it firing redundantly or stacking a duplicate route.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (!selected) onChange(option.value);
            }}
            style={[styles.segment, selected && { backgroundColor: tint }]}>
            <ThemedText variant="label" style={{ color: selected ? '#FFFFFF' : text }}>
              {selected ? '✓ ' : ''}
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: spacing.xs / 2,
    gap: spacing.xs / 2,
  },
  segment: {
    flex: 1,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
