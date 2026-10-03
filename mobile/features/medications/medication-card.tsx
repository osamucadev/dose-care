import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/ui/themed-text';
import type { Medication } from '@/domain/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { radius, spacing } from '@/theme/tokens';

import { formatTreatmentEndSummary } from './treatment-summary';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onToggleActive: () => void;
  /** True while an activate/deactivate request for this medication is in flight. */
  busy?: boolean;
}

export function MedicationCard({ medication, onEdit, onToggleActive, busy }: MedicationCardProps) {
  const tint = useThemeColor({}, 'tint');
  const tintSoft = useThemeColor({}, 'tintSoft');
  const warmSoft = useThemeColor({}, 'warmSoft');

  return (
    <Card style={!medication.active && styles.inactive}>
      <View style={styles.header}>
        <View style={[styles.iconBubble, { backgroundColor: tintSoft }]}>
          <Icon name="pill" size={20} color={tint} />
        </View>
        <View style={styles.title}>
          <ThemedText variant="subtitle" style={styles.name}>
            {medication.name}
            {medication.dosage ? ` ${medication.dosage}` : ''}
          </ThemedText>
          {medication.quantityPerDose ? (
            <ThemedText variant="muted">{medication.quantityPerDose} por dose</ThemedText>
          ) : null}
        </View>
        {!medication.active ? <ThemedText variant="muted">Inativo</ThemedText> : null}
      </View>

      <View style={styles.times}>
        {medication.times.map((time) => (
          <View key={time} style={[styles.timeChip, { backgroundColor: warmSoft }]}>
            <ThemedText variant="label">{time}</ThemedText>
          </View>
        ))}
      </View>
      <ThemedText variant="muted">{formatTreatmentEndSummary(medication)}</ThemedText>

      <View style={styles.actions}>
        <Button label="Editar" icon="edit" variant="secondary" onPress={onEdit} disabled={busy} />
        <Button
          label={medication.active ? 'Desativar' : 'Reativar'}
          variant="ghost"
          onPress={onToggleActive}
          loading={busy}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  inactive: { opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBubble: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, gap: 2 },
  name: { fontSize: 17, lineHeight: 22 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  timeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
