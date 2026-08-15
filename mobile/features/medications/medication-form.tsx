import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { toLocalDateString } from '@/domain/datetime';
import { spacing } from '@/theme/tokens';

import { medicationFormSchema, type MedicationFormValues } from './medication-schema';
import { StartDateField } from './start-date-field';
import { TimesEditor } from './times-editor';

interface MedicationFormProps {
  defaultValues?: Partial<MedicationFormValues>;
  onSubmit: (values: MedicationFormValues) => Promise<void>;
  submitLabel: string;
}

export function MedicationForm({ defaultValues, onSubmit, submitLabel }: MedicationFormProps) {
  const {
    control,
    handleSubmit,
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
      ...defaultValues,
    },
  });

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
          <StartDateField value={field.value} onChange={field.onChange} error={errors.startDate?.message} />
        )}
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
