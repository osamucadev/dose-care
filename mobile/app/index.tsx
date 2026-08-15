import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { toLocalDateString } from '@/domain/datetime';
import { computeNowAndNext, computeProfileDayStatus } from '@/domain/occurrences';
import { reconcileSelectedProfileId } from '@/domain/profile-selection';
import { doseDayTimeLabel } from '@/features/doses/dose-time';
import { NextPreview } from '@/features/doses/next-preview';
import { NowCard } from '@/features/doses/now-card';
import { UpcomingList } from '@/features/doses/upcoming-list';
import { ProfileCard } from '@/features/profiles/profile-card';
import { ProfileSelector } from '@/features/profiles/profile-selector';
import { useDoseActionHandler } from '@/hooks/use-dose-action-handler';
import { useDoses } from '@/hooks/use-doses';
import { useProfiles } from '@/hooks/use-profiles';
import { useReactiveNow } from '@/hooks/use-reactive-now';
import { getProfileTypeMeta } from '@/theme/profile-types';
import { spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { profiles, loading: profilesLoading, error: profilesError, refresh: refreshProfiles } = useProfiles();
  const { occurrences, loading: dosesLoading, error: dosesError, refresh: refreshDoses, recordDose } = useDoses();
  const { actingOccurrenceId, actionError, performDoseAction, clearActionError } = useDoseActionHandler(recordDose);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  // Called on foreground return and on local day rollover — see
  // useReactiveNow. Regular minute ticks reclassify Agora/Próximo from
  // the occurrences already in memory and never touch SQLite.
  const now = useReactiveNow({ onStale: refreshDoses });

  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
      refreshDoses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Drops a selection that no longer exists (e.g. the profile was just
  // soft-deleted) back to "Todos". Gated on a settled, successful
  // fetch so a transient loading/error state — where `profiles` is
  // momentarily `[]` — never clears a still-valid selection.
  useEffect(() => {
    if (profilesLoading || profilesError) return;
    setSelectedProfileId((current) => reconcileSelectedProfileId(current, profiles));
  }, [profiles, profilesLoading, profilesError]);

  const profilesById = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const profileNameById = useMemo(
    () => Object.fromEntries(profiles.map((p) => [p.id, p.name])),
    [profiles]
  );

  const visibleOccurrences = selectedProfileId
    ? occurrences.filter((o) => o.profileId === selectedProfileId)
    : occurrences;

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

  const todayStr = toLocalDateString(now);
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
              onRetry={clearActionError}
            />
          ) : null}

          {nowNext.now ? (
            <NowCard
              occurrence={nowNext.now}
              profileName={nowProfile?.name}
              profileAvatar={nowProfile?.avatar}
              profileTint={nowMeta?.tint}
              busy={actingOccurrenceId === nowNext.now.id}
              onTaken={() => nowNext.now && performDoseAction(nowNext.now, 'taken')}
              onSkip={() => nowNext.now && performDoseAction(nowNext.now, 'skipped')}
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
                    nextTime={nextOccurrence ? doseDayTimeLabel(nextOccurrence.scheduledAt, todayStr) : null}
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
