import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/ui/themed-text';
import { toLocalTimeString } from '@/domain/datetime';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

interface TimesEditorProps {
  value: string[];
  onChange: (times: string[]) => void;
  error?: string;
}

export function TimesEditor({ value, onChange, error }: TimesEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerValue, setPickerValue] = useState(new Date());
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  function addTime(timeStr: string) {
    if (value.includes(timeStr)) return;
    onChange([...value, timeStr].sort());
  }

  function removeTime(timeStr: string) {
    onChange(value.filter((t) => t !== timeStr));
  }

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selected) addTime(toLocalTimeString(selected));
      return;
    }
    if (selected) setPickerValue(selected);
  }

  return (
    <View style={styles.container}>
      <ThemedText variant="label">Horários *</ThemedText>

      <View style={styles.chips}>
        {value.map((time) => (
          <View key={time} style={[styles.chip, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText variant="body">{time}</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remover horário ${time}`}
              onPress={() => removeTime(time)}
              hitSlop={8}>
              <ThemedText style={{ color: danger }}>×</ThemedText>
            </Pressable>
          </View>
        ))}
      </View>

      {error ? (
        <ThemedText variant="muted" style={{ color: danger }}>
          {error}
        </ThemedText>
      ) : null}

      <Button
        label="+ Adicionar horário"
        variant="secondary"
        onPress={() => {
          setPickerValue(new Date());
          setShowPicker(true);
        }}
      />

      {showPicker ? (
        <View style={[styles.pickerWrap, { borderColor: border }]}>
          <DateTimePicker
            value={pickerValue}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' ? (
            <View style={styles.iosActions}>
              <View style={styles.grow}>
                <Button
                  label="Adicionar"
                  onPress={() => {
                    addTime(toLocalTimeString(pickerValue));
                    setShowPicker(false);
                  }}
                  fullWidth
                />
              </View>
              <View style={styles.grow}>
                <Button label="Cancelar" variant="secondary" onPress={() => setShowPicker(false)} fullWidth />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pickerWrap: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  iosActions: { flexDirection: 'row', gap: spacing.sm },
  grow: { flex: 1 },
});
