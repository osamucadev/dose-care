import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/ui/themed-text';
import type { Medication } from '@/domain/types';
import { spacing } from '@/theme/tokens';

import { formatTreatmentEndSummary } from './treatment-summary';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onToggleActive: () => void;
  /** True while an activate/deactivate request for this medication is in flight. */
  busy?: boolean;
}

export function MedicationCard({ medication, onEdit, onToggleActive, busy }: MedicationCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <ThemedText variant="subtitle" style={styles.grow}>
          💊 {medication.name}
        </ThemedText>
        {!medication.active ? <ThemedText variant="muted">Inativo</ThemedText> : null}
      </View>

      {medication.dosage ? <ThemedText variant="body">{medication.dosage}</ThemedText> : null}
      <ThemedText variant="muted">{medication.times.join(' · ')}</ThemedText>
      {medication.quantityPerDose ? (
        <ThemedText variant="muted">{medication.quantityPerDose} por dose</ThemedText>
      ) : null}
      <ThemedText variant="muted">{formatTreatmentEndSummary(medication)}</ThemedText>

      <View style={styles.actions}>
        <Button label="Editar" variant="secondary" onPress={onEdit} disabled={busy} />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
