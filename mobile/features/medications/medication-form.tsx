import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { toLocalDateString } from '@/domain/datetime';
import { spacing } from '@/theme/tokens';

import { DateField } from './date-field';
import { medicationFormSchema, type MedicationFormValues } from './medication-schema';
import { TimesEditor } from './times-editor';
import { TreatmentEndSection } from './treatment-end-section';

interface MedicationFormProps {
  defaultValues?: Partial<MedicationFormValues>;
  onSubmit: (values: MedicationFormValues) => Promise<void>;
  submitLabel: string;
}

export function MedicationForm({ defaultValues, onSubmit, submitLabel }: MedicationFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: '',
      dosage: '',
      quantityPerDose: '',
      notes: '',
      times: [],
      startDate: toLocalDateString(new Date()),
      endMode: 'ongoing',
      endDate: '',
      totalScheduledDoses: '',
      ...defaultValues,
    },
  });

  const startDate = useWatch({ control, name: 'startDate' });
  const times = useWatch({ control, name: 'times' });
  const endMode = useWatch({ control, name: 'endMode' });
  const endDate = useWatch({ control, name: 'endDate' });
  const totalScheduledDoses = useWatch({ control, name: 'totalScheduledDoses' });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            label="Nome"
            required
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
            placeholder="Ex: Losartana"
          />
        )}
      />

      <Controller
        control={control}
        name="dosage"
        render={({ field }) => (
          <TextField
            label="Dosagem"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.dosage?.message}
            placeholder="Ex: 50 mg (opcional)"
          />
        )}
      />

      <Controller
        control={control}
        name="quantityPerDose"
        render={({ field }) => (
          <TextField
            label="Quantidade por dose"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.quantityPerDose?.message}
            placeholder="Ex: 1 comprimido (opcional)"
          />
        )}
      />

      <Controller
        control={control}
        name="times"
        render={({ field }) => (
          <TimesEditor value={field.value} onChange={field.onChange} error={errors.times?.message} />
        )}
      />

      <Controller
        control={control}
        name="startDate"
        render={({ field }) => (
          <DateField label="Início *" value={field.value} onChange={field.onChange} error={errors.startDate?.message} />
        )}
      />

      <TreatmentEndSection
        endMode={endMode}
        onChangeEndMode={(mode) => {
          setValue('endMode', mode, { shouldValidate: true });
          // Clear whichever field doesn't apply to the new mode, so
          // switching back and forth never leaves a stale value behind
          // from a previously-selected mode.
          if (mode === 'ongoing') {
            setValue('endDate', '');
            setValue('totalScheduledDoses', '');
          } else if (mode === 'end_date') {
            setValue('totalScheduledDoses', '');
            if (!endDate) setValue('endDate', startDate);
          } else {
            setValue('endDate', '');
          }
        }}
        startDate={startDate}
        timesCount={times.length}
        endDate={endDate ?? ''}
        onChangeEndDate={(value) => setValue('endDate', value, { shouldValidate: true })}
        endDateError={errors.endDate?.message}
        totalScheduledDoses={totalScheduledDoses ?? ''}
        onChangeTotalScheduledDoses={(value) => setValue('totalScheduledDoses', value, { shouldValidate: true })}
        totalScheduledDosesError={errors.totalScheduledDoses?.message}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <TextField
            label="Observações"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.notes?.message}
            placeholder="Opcional"
            multiline
          />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});
