import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/ui/themed-text';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

import { AvatarPicker } from './avatar-picker';
import { profileFormSchema, type ProfileFormValues } from './profile-schema';
import { ProfileTypePicker } from './profile-type-picker';

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  submitLabel: string;
}

export function ProfileForm({ defaultValues, onSubmit, submitLabel }: ProfileFormProps) {
  const initialType = defaultValues?.type ?? 'adult';
  const initialMeta = getProfileTypeMeta(initialType);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      type: initialType,
      avatar: initialMeta.defaultAvatar,
      color: initialMeta.color,
      notes: '',
      ...defaultValues,
    },
  });

  const selectedType = watch('type');
  const meta = getProfileTypeMeta(selectedType);

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
            placeholder="Ex: Florita"
          />
        )}
      />

      <View style={styles.field}>
        <ThemedText variant="label">Tipo *</ThemedText>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <ProfileTypePicker
              value={field.value}
              onChange={(type) => {
                field.onChange(type);
                const nextMeta = getProfileTypeMeta(type);
                setValue('color', nextMeta.color);
                setValue('avatar', nextMeta.defaultAvatar);
              }}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText variant="label">Avatar *</ThemedText>
        <Controller
          control={control}
          name="avatar"
          render={({ field }) => (
            <AvatarPicker
              options={meta.avatarOptions}
              value={field.value}
              onChange={field.onChange}
              tint={meta.tint}
            />
          )}
        />
        {errors.avatar ? (
          <ThemedText variant="muted" style={{ color: meta.color }}>
            {errors.avatar.message}
          </ThemedText>
        ) : null}
      </View>

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

      <Button
        label={submitLabel}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  field: { gap: spacing.xs },
});
