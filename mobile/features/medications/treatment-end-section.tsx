import { StyleSheet, View } from 'react-native';

import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/ui/themed-text';
import { inclusiveDaySpan } from '@/domain/datetime';
import { estimateDoseCountDuration } from '@/domain/occurrences';
import type { TreatmentEndMode } from '@/domain/types';
import { spacing } from '@/theme/tokens';

import { DateField } from './date-field';

const END_MODE_OPTIONS: [
  SegmentedOption<TreatmentEndMode>,
  SegmentedOption<TreatmentEndMode>,
  SegmentedOption<TreatmentEndMode>,
] = [
  { value: 'ongoing', label: 'Contínuo' },
  { value: 'end_date', label: 'Até uma data' },
  { value: 'dose_count', label: 'Por quantidade' },
];

interface TreatmentEndSectionProps {
  endMode: TreatmentEndMode;
  onChangeEndMode: (mode: TreatmentEndMode) => void;
  startDate: string;
  /** Number of fixed times configured — drives the dose-count estimate. */
  timesCount: number;
  endDate: string;
  onChangeEndDate: (value: string) => void;
  endDateError?: string;
  totalScheduledDoses: string;
  onChangeTotalScheduledDoses: (value: string) => void;
  totalScheduledDosesError?: string;
}

/**
 * The "Duração do tratamento" picker: Contínuo / Até uma data / Por
 * quantidade de doses, reusing the same `SegmentedControl` as the
 * profile screen's Visão geral/Histórico tabs — same accessibility
 * behavior (tablist/tab roles, selected state never signaled by color
 * alone), same touch targets.
 */
export function TreatmentEndSection({
  endMode,
  onChangeEndMode,
  startDate,
  timesCount,
  endDate,
  onChangeEndDate,
  endDateError,
  totalScheduledDoses,
  onChangeTotalScheduledDoses,
  totalScheduledDosesError,
}: TreatmentEndSectionProps) {
  const parsedCount = Number(totalScheduledDoses);
  const hasValidCount =
    totalScheduledDoses.trim().length > 0 && Number.isInteger(parsedCount) && parsedCount > 0;
  const estimate = hasValidCount && timesCount > 0 ? estimateDoseCountDuration(parsedCount, timesCount) : null;

  const hasValidRange = endDate.length > 0 && endDate >= startDate;

  return (
    <View style={styles.container}>
      <ThemedText variant="label">Duração do tratamento *</ThemedText>
      <SegmentedControl
        accessibilityLabel="Duração do tratamento"
        value={endMode}
        onChange={onChangeEndMode}
        options={END_MODE_OPTIONS}
      />

      {endMode === 'ongoing' ? (
        <ThemedText variant="muted">A rotina não possui data de término.</ThemedText>
      ) : null}

      {endMode === 'end_date' ? (
        <View style={styles.field}>
          <DateField
            label="Até *"
            value={endDate || startDate}
            onChange={onChangeEndDate}
            error={endDateError}
            minimumDate={startDate}
          />
          <ThemedText variant="muted">As doses também serão programadas nesta data.</ThemedText>
          {hasValidRange ? (
            <ThemedText variant="muted">
              {inclusiveDaySpan(startDate, endDate)} dias de tratamento, contando início e término.
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {endMode === 'dose_count' ? (
        <View style={styles.field}>
          <TextField
            label="Quantidade de doses programadas"
            required
            value={totalScheduledDoses}
            onChangeText={onChangeTotalScheduledDoses}
            error={totalScheduledDosesError}
            placeholder="Ex: 60"
            keyboardType="number-pad"
          />
          <ThemedText variant="muted">
            Doses puladas também contam nessa quantidade — o tratamento não é prolongado automaticamente
            para compensá-las.
          </ThemedText>
          {estimate ? (
            <ThemedText variant="muted">
              {estimate.exact
                ? `Estimativa: cerca de ${estimate.days} dia${estimate.days === 1 ? '' : 's'} de tratamento.`
                : `Estimativa: cerca de ${estimate.days} dia${estimate.days === 1 ? '' : 's'} de tratamento — o último dia terá apenas ${estimate.dosesOnLastDay} dose${estimate.dosesOnLastDay === 1 ? '' : 's'}.`}{' '}
              Informação organizacional, não é uma recomendação médica.
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  field: { gap: spacing.xs },
});
