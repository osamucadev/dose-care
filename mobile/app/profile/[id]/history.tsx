import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { HistoryList } from '@/features/history/history-list';
import { ProfileNavTabs } from '@/features/profiles/profile-nav-tabs';
import { useHistory } from '@/hooks/use-history';

export default function ProfileHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, loading, error, refresh } = useHistory(id);

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <ScreenContainer>
      <ProfileNavTabs active="history" onSelectOverview={() => router.back()} onSelectHistory={() => {}} />

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
