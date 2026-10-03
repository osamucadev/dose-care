import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/ui/themed-text';
import { RestockBadge } from '@/features/medications/restock-badge';
import { stockSummary } from '@/features/medications/stock-labels';
import { spacing } from '@/theme/tokens';
import { useMedicationStockViewModel } from '@/view-models/use-medication-stock-view-model';

export default function MedicationStockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useMedicationStockViewModel(id);
  const [dosesText, setDosesText] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();

  if (vm.status === 'loading') {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando estoque…" />
      </ScreenContainer>
    );
  }

  if (vm.status === 'error') {
    return (
      <ScreenContainer>
        <ErrorState onRetry={vm.retry} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <ThemedText variant="title">{vm.medicationLabel}</ThemedText>
        {vm.current ? (
          <Card style={styles.current}>
            <ThemedText variant="label">ESTOQUE ATUAL</ThemedText>
            <ThemedText variant="body">{stockSummary(vm.current)}</ThemedText>
            <RestockBadge level={vm.current.level} />
          </Card>
        ) : null}
      </View>

      {vm.hasSubmitError ? (
        <ErrorState message="Não foi possível salvar o estoque agora." onRetry={vm.dismissSubmitError} />
      ) : null}

      <TextField
        label="Quantas doses você tem agora?"
        required
        value={dosesText}
        onChangeText={(text) => {
          setDosesText(text);
          setFieldError(undefined);
        }}
        error={fieldError}
        placeholder="Ex: 30"
        keyboardType="number-pad"
      />

      <ThemedText variant="muted">
        Conte as doses que você tem em mãos, incluindo as que acabou de comprar. Cada dose marcada como tomada
        desconta 1 do estoque. Quando restarem {vm.lowStockPercent}% dessa quantidade, o DoseCare lembra você de
        providenciar mais, uma vez por dia.
      </ThemedText>

      <Button
        label="Salvar estoque"
        loading={vm.saving}
        fullWidth
        onPress={async () => setFieldError((await vm.submit(dosesText)) ?? undefined)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md },
  current: { gap: spacing.xs },
});
