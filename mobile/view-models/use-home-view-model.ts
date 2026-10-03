import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { reconcileSelectedProfileId } from '@/domain/profile-selection';
import type { DoseOccurrence, Profile } from '@/domain/types';
import { formatHomeDate } from '@/features/home/home-date';
import { useDoseActionHandler } from '@/hooks/use-dose-action-handler';
import { useDoses } from '@/hooks/use-doses';
import { useProfiles } from '@/hooks/use-profiles';
import { useReactiveNow } from '@/hooks/use-reactive-now';

import { buildHomeDosesState, type HomeDosesState } from './home-view-state';

export type HomeDosesSection =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | ({ status: 'ready' } & HomeDosesState);

export type HomeViewModel =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'empty'; addProfile: () => void }
  | {
      status: 'ready';
      dateLabel: string;
      profiles: Profile[];
      selectedProfileId: string | null;
      selectProfile: (id: string | null) => void;
      doses: HomeDosesSection;
      /** Occurrence whose Tomado/Pular is being saved, to show a busy state. */
      actingOccurrenceId: string | null;
      hasActionError: boolean;
      dismissActionError: () => void;
      markTaken: (occurrence: DoseOccurrence) => void;
      skip: (occurrence: DoseOccurrence) => void;
      openProfile: (id: string) => void;
      addProfile: () => void;
    };

export function useHomeViewModel(): HomeViewModel {
  const router = useRouter();
  const { profiles, loading: profilesLoading, error: profilesError, refresh: refreshProfiles } = useProfiles();
  const { occurrences, loading: dosesLoading, error: dosesError, refresh: refreshDoses, recordDose } = useDoses();
  const { actingOccurrenceId, actionError, performDoseAction, clearActionError } = useDoseActionHandler(recordDose);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  // Called on foreground return and on local day rollover (see
  // useReactiveNow). Regular minute ticks reclassify Agora/Próximo from
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
  // soft-deleted) back to "Todos". Gated on a settled, successful fetch
  // so a transient loading/error state, where `profiles` is momentarily
  // `[]`, never clears a still-valid selection.
  useEffect(() => {
    if (profilesLoading || profilesError) return;
    setSelectedProfileId((current) => reconcileSelectedProfileId(current, profiles));
  }, [profiles, profilesLoading, profilesError]);

  const dosesState = useMemo(
    () => buildHomeDosesState({ profiles, occurrences, selectedProfileId, now }),
    [profiles, occurrences, selectedProfileId, now]
  );

  const addProfile = useCallback(() => router.push('/profile/new'), [router]);

  if (profilesLoading) return { status: 'loading' };
  if (profilesError) return { status: 'error', retry: refreshProfiles };
  if (profiles.length === 0) return { status: 'empty', addProfile };

  const doses: HomeDosesSection = dosesError
    ? { status: 'error', retry: refreshDoses }
    : dosesLoading && occurrences.length === 0
      ? { status: 'loading' }
      : { status: 'ready', ...dosesState };

  return {
    status: 'ready',
    dateLabel: formatHomeDate(now),
    profiles,
    selectedProfileId,
    selectProfile: setSelectedProfileId,
    doses,
    actingOccurrenceId,
    hasActionError: actionError !== null,
    dismissActionError: clearActionError,
    markTaken: (occurrence) => void performDoseAction(occurrence, 'taken'),
    skip: (occurrence) => void performDoseAction(occurrence, 'skipped'),
    openProfile: (id) => router.push(`/profile/${id}`),
    addProfile,
  };
}
