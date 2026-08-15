import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { parseLocalDateTime, toLocalDateString } from '@/domain/datetime';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

interface StartDateFieldProps {
  value: string;
  onChange: (dateStr: string) => void;
  error?: string;
}

export function StartDateField({ value, onChange, error }: StartDateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const border = useThemeColor({}, error ? 'danger' : 'border');
  const surface = useThemeColor({}, 'surface');
  const danger = useThemeColor({}, 'danger');

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selected) onChange(toLocalDateString(selected));
  }

  return (
    <View style={styles.container}>
      <ThemedText variant="label">Início *</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Data de início: ${value}`}
        onPress={() => setShowPicker(true)}
        style={[styles.field, { borderColor: border, backgroundColor: surface }]}>
        <ThemedText variant="body">{value}</ThemedText>
      </Pressable>
      {error ? (
        <ThemedText variant="muted" style={{ color: danger }}>
          {error}
        </ThemedText>
      ) : null}
      {showPicker ? (
        <DateTimePicker
          value={parseLocalDateTime(`${value}T00:00`)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  field: { minHeight: 48, justifyContent: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md },
});
