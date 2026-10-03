import { StyleSheet, View } from 'react-native';

import CalmIllustration from '@/assets/svg/illustrations/onboarding-calm.svg';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ThemedText } from '@/components/ui/themed-text';
import { AllClearCard } from '@/features/doses/all-clear-card';
import { NextPreview } from '@/features/doses/next-preview';
import { NowCard } from '@/features/doses/now-card';
import { UpcomingList } from '@/features/doses/upcoming-list';
import { RestockList } from '@/features/medications/restock-list';
import { ProfileCard } from '@/features/profiles/profile-card';
import { ProfileSelector } from '@/features/profiles/profile-selector';
import { spacing } from '@/theme/tokens';
import { useHomeViewModel } from '@/view-models/use-home-view-model';

export default function HomeScreen() {
  const vm = useHomeViewModel();

  if (vm.status === 'loading') {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando seus perfis…" />
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

  if (vm.status === 'empty') {
    return (
      <ScreenContainer>
        <EmptyState
          illustration={CalmIllustration}
          title="Comece adicionando quem você cuida"
          description="Pessoas, pets ou plantas, cada um com sua própria rotina."
          actionLabel="+ Adicionar perfil"
          onAction={vm.addProfile}
        />
      </ScreenContainer>
    );
  }

  const { doses } = vm;

  return (
    <ScreenContainer>
      <ThemedText variant="subtitle" style={styles.date}>
        {vm.dateLabel}
      </ThemedText>

      <ProfileSelector profiles={vm.profiles} selectedId={vm.selectedProfileId} onSelect={vm.selectProfile} />

      {doses.status === 'error' ? (
        <ErrorState onRetry={doses.retry} />
      ) : doses.status === 'loading' ? (
        <LoadingState label="Carregando as doses de hoje…" />
      ) : (
        <>
          {vm.hasActionError ? (
            <ErrorState message="Não foi possível registrar essa dose agora." onRetry={vm.dismissActionError} />
          ) : null}

          {doses.now ? (
            <NowCard
              occurrence={doses.now}
              profileName={doses.nowProfile?.name}
              profileAvatar={doses.nowProfile?.avatar}
              profileTint={doses.nowProfile?.tint}
              busy={vm.actingOccurrenceId === doses.now.id}
              onTaken={() => doses.now && vm.markTaken(doses.now)}
              onSkip={() => doses.now && vm.skip(doses.now)}
            />
          ) : (
            <AllClearCard />
          )}

          {doses.next ? <NextPreview occurrence={doses.next} profile={doses.nextProfile ?? undefined} /> : null}

          {vm.restock.length > 0 ? <RestockList rows={vm.restock} onSelect={vm.updateStock} /> : null}

          {doses.profileRows ? (
            <View style={styles.profileList}>
              <ThemedText variant="subtitle">Perfis</ThemedText>
              {doses.profileRows.map((row) => (
                <ProfileCard
                  key={row.profile.id}
                  profile={row.profile}
                  status={row.status}
                  nextTime={row.nextTime}
                  onPress={() => vm.openProfile(row.profile.id)}
                />
              ))}
            </View>
          ) : vm.selectedProfileId ? (
            <Button
              label="Ver perfil completo"
              icon="arrow-right"
              variant="secondary"
              onPress={() => vm.selectedProfileId && vm.openProfile(vm.selectedProfileId)}
            />
          ) : null}

          <Button label="Adicionar perfil" icon="plus" variant="soft" onPress={vm.addProfile} />

          <UpcomingList
            title={doses.upcomingTitle}
            occurrences={doses.upcoming}
            profilesById={doses.upcomingProfilesById}
            emptyLabel={doses.upcomingEmptyLabel}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  date: { marginBottom: -spacing.sm },
  profileList: { gap: spacing.md },
});
