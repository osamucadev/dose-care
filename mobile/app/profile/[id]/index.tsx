import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { computeNowAndNext } from '@/domain/occurrences';
import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';
import { NextPreview } from '@/features/doses/next-preview';
import { NowCard } from '@/features/doses/now-card';
import { UpcomingList } from '@/features/doses/upcoming-list';
import { MedicationCard } from '@/features/medications/medication-card';
import { useDoses } from '@/hooks/use-doses';
import { useMedications } from '@/hooks/use-medications';
import { useProfile } from '@/hooks/use-profile';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = useProfile(id);
  const {
    medications,
    loading: medicationsLoading,
    error: medicationsError,
    refresh: refreshMedications,
    setActive,
  } = useMedications(id, { includeInactive: true });
  const { occurrences, loading: dosesLoading, error: dosesError, refresh: refreshDoses, recordDose } = useDoses(id);
  const [actingOccurrenceId, setActingOccurrenceId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refreshMedications();
      refreshDoses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function handleAction(occurrence: DoseOccurrence, status: DoseEventStatus) {
    setActingOccurrenceId(occurrence.id);
    setActionError(null);
    try {
      await recordDose(occurrence, status);
    } catch (err) {
      setActionError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setActingOccurrenceId(null);
    }
  }

  if (profileLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando perfil…" />
      </ScreenContainer>
    );
  }

  if (profileError || !profile) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refreshProfile} />
      </ScreenContainer>
    );
  }

  const meta = getProfileTypeMeta(profile.type);
  const now = new Date();
  const nowNext = computeNowAndNext(occurrences, now);

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: profile.name,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              hitSlop={8}
              onPress={() => router.push(`/profile/${profile.id}/edit`)}>
              <ThemedText style={{ color: meta.color }}>✎ Editar</ThemedText>
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <Avatar emoji={profile.avatar} tint={meta.tint} size={56} />
        <View>
          <ThemedText variant="title">{profile.name}</ThemedText>
          <ThemedText variant="muted">{meta.label}</ThemedText>
        </View>
      </View>

      {actionError ? (
        <ErrorState message="Não foi possível registrar essa dose agora." onRetry={() => setActionError(null)} />
      ) : null}

      {dosesError ? (
        <ErrorState onRetry={refreshDoses} />
      ) : dosesLoading && occurrences.length === 0 ? (
        <LoadingState label="Carregando as doses de hoje…" />
      ) : nowNext.now ? (
        <NowCard
          occurrence={nowNext.now}
          busy={actingOccurrenceId === nowNext.now.id}
          onTaken={() => nowNext.now && handleAction(nowNext.now, 'taken')}
          onSkip={() => nowNext.now && handleAction(nowNext.now, 'skipped')}
        />
      ) : (
        <View style={styles.okBanner}>
          <ThemedText variant="subtitle">Tudo certo por aqui 🌿</ThemedText>
        </View>
      )}

      {nowNext.next ? <NextPreview occurrence={nowNext.next} /> : null}

      <UpcomingList
        title="Próximas doses de hoje"
        occurrences={nowNext.upcomingToday}
        emptyLabel="Nenhuma dose pendente hoje."
      />

      <View style={styles.section}>
        <ThemedText variant="subtitle">Rotina</ThemedText>

        {medicationsError ? (
          <ErrorState onRetry={refreshMedications} />
        ) : medicationsLoading ? (
          <LoadingState label="Carregando medicamentos…" />
        ) : medications.length === 0 ? (
          <EmptyState
            title="Nenhum medicamento de rotina"
            description="Medicamentos recorrentes aparecerão aqui e poderão gerar lembretes."
            actionLabel="+ Adicionar medicamento (Rotina)"
            onAction={() => router.push({ pathname: '/medication/new', params: { profileId: profile.id } })}
          />
        ) : (
          <View style={styles.medicationList}>
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={() => router.push(`/medication/${medication.id}/edit`)}
                onToggleActive={() => {
                  setActive(medication.id, !medication.active).catch((err: unknown) => {
                    setActionError(err instanceof Error ? err : new Error(String(err)));
                  });
                }}
              />
            ))}
            <Button
              label="+ Adicionar medicamento (Rotina)"
              variant="secondary"
              onPress={() => router.push({ pathname: '/medication/new', params: { profileId: profile.id } })}
            />
          </View>
        )}
      </View>

      <Button label="Ver histórico" variant="ghost" onPress={() => router.push(`/profile/${profile.id}/history`)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { gap: spacing.md },
  medicationList: { gap: spacing.md },
  okBanner: { paddingVertical: spacing.md },
});
