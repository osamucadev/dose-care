import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { computeNowAndNext, computeProfileDayStatus } from '@/domain/occurrences';
import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';
import { doseTimeLabel } from '@/features/doses/dose-time';
import { NextPreview } from '@/features/doses/next-preview';
import { NowCard } from '@/features/doses/now-card';
import { UpcomingList } from '@/features/doses/upcoming-list';
import { ProfileCard } from '@/features/profiles/profile-card';
import { ProfileSelector } from '@/features/profiles/profile-selector';
import { useDoses } from '@/hooks/use-doses';
import { useProfiles } from '@/hooks/use-profiles';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { profiles, loading: profilesLoading, error: profilesError, refresh: refreshProfiles } = useProfiles();
  const { occurrences, loading: dosesLoading, error: dosesError, refresh: refreshDoses, recordDose } = useDoses();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [actingOccurrenceId, setActingOccurrenceId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
      refreshDoses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const profilesById = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const profileNameById = useMemo(
    () => Object.fromEntries(profiles.map((p) => [p.id, p.name])),
    [profiles]
  );

  const visibleOccurrences = selectedProfileId
    ? occurrences.filter((o) => o.profileId === selectedProfileId)
    : occurrences;

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

  if (profilesLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando seus perfis…" />
      </ScreenContainer>
    );
  }

  if (profilesError) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refreshProfiles} />
      </ScreenContainer>
    );
  }

  if (profiles.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          emoji="🌿"
          title="Comece adicionando quem você cuida"
          description="Pessoas, pets ou plantas — cada um com sua própria rotina."
          actionLabel="+ Adicionar perfil"
          onAction={() => router.push('/profile/new')}
        />
      </ScreenContainer>
    );
  }

  const now = new Date();
  const nowNext = computeNowAndNext(visibleOccurrences, now);
  const nowProfile = nowNext.now ? profilesById[nowNext.now.profileId] : undefined;
  const nowMeta = nowProfile ? getProfileTypeMeta(nowProfile.type) : undefined;

  return (
    <ScreenContainer>
      <ProfileSelector profiles={profiles} selectedId={selectedProfileId} onSelect={setSelectedProfileId} />

      {dosesError ? (
        <ErrorState onRetry={refreshDoses} />
      ) : dosesLoading && occurrences.length === 0 ? (
        <LoadingState label="Carregando as doses de hoje…" />
      ) : (
        <>
          {actionError ? (
            <ErrorState
              message="Não foi possível registrar essa dose agora."
              onRetry={() => setActionError(null)}
            />
          ) : null}

          {nowNext.now ? (
            <NowCard
              occurrence={nowNext.now}
              profileName={nowProfile?.name}
              profileAvatar={nowProfile?.avatar}
              profileTint={nowMeta?.tint}
              busy={actingOccurrenceId === nowNext.now.id}
              onTaken={() => nowNext.now && handleAction(nowNext.now, 'taken')}
              onSkip={() => nowNext.now && handleAction(nowNext.now, 'skipped')}
            />
          ) : (
            <View style={styles.okBanner}>
              <ThemedText variant="subtitle">Tudo certo por aqui 🌿</ThemedText>
            </View>
          )}

          {nowNext.next ? (
            <NextPreview occurrence={nowNext.next} profileName={profileNameById[nowNext.next.profileId]} />
          ) : null}

          {selectedProfileId ? (
            <Button
              label="Ver perfil completo"
              variant="secondary"
              onPress={() => router.push(`/profile/${selectedProfileId}`)}
            />
          ) : (
            <View style={styles.grid}>
              {profiles.map((profile) => {
                const profileOccurrences = occurrences.filter((o) => o.profileId === profile.id);
                const status = computeProfileDayStatus(profileOccurrences, now);
                const nextOccurrence = computeNowAndNext(profileOccurrences, now).next;
                return (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    status={status}
                    nextTime={nextOccurrence ? doseTimeLabel(nextOccurrence.scheduledAt) : null}
                    onPress={() => router.push(`/profile/${profile.id}`)}
                  />
                );
              })}
            </View>
          )}

          <Button label="+ Adicionar perfil" variant="secondary" onPress={() => router.push('/profile/new')} />

          <UpcomingList
            title={selectedProfileId ? 'Próximas doses de hoje' : 'Próximos'}
            occurrences={nowNext.upcomingToday.slice(0, 5)}
            profileNameById={selectedProfileId ? undefined : profileNameById}
            emptyLabel="Nenhuma dose pendente por aqui."
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  okBanner: { paddingVertical: spacing.md },
});
