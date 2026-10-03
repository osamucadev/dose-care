import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { AllClearCard } from '@/features/doses/all-clear-card';
import { NextPreview } from '@/features/doses/next-preview';
import { NowCard } from '@/features/doses/now-card';
import { UpcomingList } from '@/features/doses/upcoming-list';
import { MedicationCard } from '@/features/medications/medication-card';
import { ProfileNavTabs } from '@/features/profiles/profile-nav-tabs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { minTouchTarget, spacing } from '@/theme/tokens';
import { useProfileViewModel } from '@/view-models/use-profile-view-model';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useProfileViewModel(id);
  const tint = useThemeColor({}, 'tint');

  if (vm.status === 'loading') {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando perfil…" />
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

  const { doses, medications } = vm;

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: vm.name,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              hitSlop={8}
              style={styles.editButton}
              onPress={vm.editProfile}>
              <Icon name="edit" size={18} color={tint} />
              <ThemedText variant="label" style={{ color: tint }}>
                Editar
              </ThemedText>
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <Avatar emoji={vm.avatar} tint={vm.avatarTint} size={64} />
        <View style={styles.headerText}>
          <ThemedText variant="title">{vm.name}</ThemedText>
          <ThemedText variant="muted">{vm.typeLabel}</ThemedText>
        </View>
      </View>

      <ProfileNavTabs active="overview" onSelectOverview={() => {}} onSelectHistory={vm.openHistory} />

      {vm.hasActionError ? (
        <ErrorState message="Não foi possível registrar essa dose agora." onRetry={vm.dismissActionError} />
      ) : null}

      {doses.status === 'error' ? (
        <ErrorState onRetry={doses.retry} />
      ) : doses.status === 'loading' ? (
        <LoadingState label="Carregando as doses de hoje…" />
      ) : (
        <>
          {doses.now ? (
            <NowCard
              occurrence={doses.now}
              busy={vm.actingOccurrenceId === doses.now.id}
              onTaken={() => doses.now && vm.markTaken(doses.now)}
              onSkip={() => doses.now && vm.skip(doses.now)}
            />
          ) : (
            <AllClearCard />
          )}

          {doses.next ? <NextPreview occurrence={doses.next} /> : null}

          <UpcomingList
            title="Próximas doses de hoje"
            occurrences={doses.upcoming}
            emptyLabel="Nenhuma dose pendente hoje."
          />
        </>
      )}

      <View style={styles.section}>
        <ThemedText variant="subtitle">Rotina</ThemedText>

        {vm.hasToggleError ? (
          <ErrorState message="Não foi possível atualizar esse medicamento agora." onRetry={vm.dismissToggleError} />
        ) : null}

        {medications.status === 'error' ? (
          <ErrorState onRetry={medications.retry} />
        ) : medications.status === 'loading' ? (
          <LoadingState label="Carregando medicamentos…" />
        ) : medications.items.length === 0 ? (
          <EmptyState
            title="Nenhum medicamento de rotina"
            description="Medicamentos recorrentes aparecerão aqui e poderão gerar lembretes."
            actionLabel="Adicionar medicamento (Rotina)"
            onAction={vm.addMedication}
          />
        ) : (
          <View style={styles.medicationList}>
            {medications.items.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                busy={vm.togglingMedicationId === medication.id}
                onEdit={() => vm.editMedication(medication.id)}
                onToggleActive={() => vm.toggleMedication(medication)}
              />
            ))}
            <Button label="Adicionar medicamento (Rotina)" icon="plus" variant="soft" onPress={vm.addMedication} />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { gap: spacing.md },
  medicationList: { gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.xs,
  },
});
