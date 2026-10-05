import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { normalizeProfileId } from '@/domain/route-params';
import type { HistoryEntry } from '@/domain/history';
import { useHistory } from '@/hooks/use-history';

export type ProfileHistoryViewModel =
  | { status: 'invalid' }
  | { status: 'loading'; openOverview: () => void }
  | { status: 'error'; retry: () => void; openOverview: () => void }
  | { status: 'ready'; entries: HistoryEntry[]; openOverview: () => void };

export function useProfileHistoryViewModel(rawId: string | string[] | undefined): ProfileHistoryViewModel {
  const router = useRouter();
  const profileId = normalizeProfileId(rawId);
  const { events, loading, error, refresh } = useHistory(profileId ?? undefined);

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  if (!profileId) return { status: 'invalid' };

  // Explicit route instead of router.back(): this screen can be reached
  // from places other than the profile overview (deep link, restored
  // state), where "back" wouldn't land there. replace (not push) so
  // History doesn't stay stacked under the overview.
  const openOverview = () => router.replace(`/profile/${profileId}`);

  if (loading) return { status: 'loading', openOverview };
  if (error) return { status: 'error', retry: refresh, openOverview };
  return { status: 'ready', entries: events, openOverview };
}
