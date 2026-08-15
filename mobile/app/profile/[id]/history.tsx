import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { normalizeProfileId } from '@/domain/route-params';
import { HistoryList } from '@/features/history/history-list';
import { ProfileNavTabs } from '@/features/profiles/profile-nav-tabs';
import { useHistory } from '@/hooks/use-history';

export default function ProfileHistoryScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const router = useRouter();
  const profileId = normalizeProfileId(rawId);
  const { events, loading, error, refresh } = useHistory(profileId ?? undefined);

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  if (!profileId) {
    return (
      <ScreenContainer>
        <ErrorState message="Não foi possível abrir este histórico." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ProfileNavTabs
        active="history"
        // Explicit route instead of router.back(): this screen can be
        // reached from places other than the profile overview (deep
        // link, restored state), where "back" wouldn't land there.
        // replace (not push) so History doesn't stay stacked under the
        // new Profile screen — see the matching replace on the
        // overview's "Histórico" tab.
        onSelectOverview={() => router.replace(`/profile/${profileId}`)}
        onSelectHistory={() => {}}
      />

      {loading ? (
        <LoadingState label="Carregando histórico…" />
      ) : error ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <HistoryList events={events} />
      )}
    </ScreenContainer>
  );
}
