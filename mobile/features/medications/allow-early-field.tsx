import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { minTouchTarget, spacing } from '@/theme/tokens';

interface AllowEarlyFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * The per-medication "take early" option. The whole row is the control,
 * so the touch target is the full width and a screen reader reads the
 * label and the explanation together with the on/off state.
 */
export function AllowEarlyField({ value, onChange }: AllowEarlyFieldProps) {
  const tint = useThemeColor({}, 'tint');
  const inputBorder = useThemeColor({}, 'inputBorder');
  const surface = useThemeColor({}, 'surface');

  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel="Pode ser tomado antes do horário, no mesmo dia"
      accessibilityHint="Ligue apenas se quem orienta o tratamento permitir."
      style={styles.row}
    >
      <View style={styles.text}>
        <ThemedText variant="label">Pode ser tomado antes do horário, no mesmo dia</ThemedText>
        <ThemedText variant="muted">
          Mostra &quot;Tomar agora&quot; na próxima dose do dia. Ligue apenas se quem orienta o tratamento
          permitir.
        </ThemedText>
      </View>
      {/* Hidden from accessibility: the row already is the switch. */}
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: inputBorder, true: tint }}
          thumbColor={surface}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: minTouchTarget },
  text: { flex: 1, gap: spacing.xs },
});
