import { useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { HistoryList } from '@/features/history/history-list';
import { ProfileNavTabs } from '@/features/profiles/profile-nav-tabs';
import { useProfileHistoryViewModel } from '@/view-models/use-profile-history-view-model';

export default function ProfileHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const vm = useProfileHistoryViewModel(id);

  if (vm.status === 'invalid') {
    return (
      <ScreenContainer>
        <ErrorState message="Não foi possível abrir este histórico." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ProfileNavTabs active="history" onSelectOverview={vm.openOverview} onSelectHistory={() => {}} />

      {vm.status === 'loading' ? (
        <LoadingState label="Carregando histórico…" />
      ) : vm.status === 'error' ? (
        <ErrorState onRetry={vm.retry} />
      ) : (
        <HistoryList entries={vm.entries} />
      )}
    </ScreenContainer>
  );
}
