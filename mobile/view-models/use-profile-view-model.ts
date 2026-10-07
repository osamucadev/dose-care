import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { toLocalDateString } from '@/domain/datetime';
import { computeNowAndNext, earlyTakeableIds } from '@/domain/occurrences';
import type { StockStatus } from '@/domain/stock';
import type { DoseOccurrence, Medication, SkinTone } from '@/domain/types';
import { useDoseActionHandler } from '@/hooks/use-dose-action-handler';
import { useDoses } from '@/hooks/use-doses';
import { useMedicationToggleHandler } from '@/hooks/use-medication-toggle-handler';
import { useMedications } from '@/hooks/use-medications';
import { useProfile } from '@/hooks/use-profile';
import { useReactiveNow } from '@/hooks/use-reactive-now';
import { useStockStatuses } from '@/hooks/use-stock-statuses';
import { getProfileTypeMeta } from '@/theme/profile-types';

import { upcomingEmptyLabel } from './home-view-state';

export type ProfileDosesSection =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'ready';
      now: DoseOccurrence | null;
      next: DoseOccurrence | null;
      upcoming: DoseOccurrence[];
      upcomingEmptyLabel: string;
      /** Doses shown in Próximo or Próximas that can be taken now ("Tomar agora"). */
      earlyIds: ReadonlySet<string>;
    };

export type ProfileMedicationsSection =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; items: Medication[]; stockByMedication: Record<string, StockStatus> };

export type ProfileViewModel =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'ready';
      name: string;
      typeLabel: string;
      avatar: string;
      skinTone: SkinTone;
      avatarTint: string;
      doses: ProfileDosesSection;
      medications: ProfileMedicationsSection;
      hasActionError: boolean;
      dismissActionError: () => void;
      markTaken: (occurrence: DoseOccurrence) => void;
      skip: (occurrence: DoseOccurrence) => void;
      /** "Tomar agora" on a dose not due yet; same undo window as Tomado. */
      takeEarly: (occurrence: DoseOccurrence) => void;
      togglingMedicationId: string | null;
      hasToggleError: boolean;
      dismissToggleError: () => void;
      toggleMedication: (medication: Medication) => void;
      editProfile: () => void;
      openHistory: () => void;
      addMedication: () => void;
      editMedication: (id: string) => void;
      updateStock: (medicationId: string) => void;
    };

export function useProfileViewModel(id: string): ProfileViewModel {
  const router = useRouter();
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = useProfile(id);
  const {
    medications,
    loading: medicationsLoading,
    error: medicationsError,
    refresh: refreshMedications,
    setActive,
  } = useMedications(id, { includeInactive: true });
  const { occurrences, loading: dosesLoading, error: dosesError, refresh: refreshDoses } = useDoses(id);
  const { performDoseAction, hasActionError, clearActionError } = useDoseActionHandler();
  const { togglingMedicationId, toggleError, performToggle, clearToggleError } = useMedicationToggleHandler(
    setActive,
    refreshDoses
  );
  // Called on foreground return and on local day rollover; regular
  // minute ticks just reclassify Agora/Próximo from occurrences already
  // in memory, no SQLite access.
  const now = useReactiveNow({ onStale: refreshDoses });
  // Re-read whenever occurrences reload: a dose just marked as taken
  // consumed stock.
  const { stockByMedication } = useStockStatuses(medications, occurrences);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refreshMedications();
      refreshDoses();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const nowNext = useMemo(() => computeNowAndNext(occurrences, now), [occurrences, now]);
  const earlyIds = useMemo(() => earlyTakeableIds(occurrences, now), [occurrences, now]);

  if (profileLoading) return { status: 'loading' };
  if (profileError || !profile) return { status: 'error', retry: refreshProfile };

  const meta = getProfileTypeMeta(profile.type);

  return {
    status: 'ready',
    name: profile.name,
    typeLabel: meta.label,
    avatar: profile.avatar,
    skinTone: profile.skinTone,
    avatarTint: meta.tint,
    doses: dosesError
      ? { status: 'error', retry: refreshDoses }
      : dosesLoading && occurrences.length === 0
        ? { status: 'loading' }
        : {
            status: 'ready',
            now: nowNext.now,
            next: nowNext.next,
            upcoming: nowNext.upcomingToday,
            upcomingEmptyLabel: upcomingEmptyLabel(nowNext.now, nowNext.next, toLocalDateString(now)),
            earlyIds,
          },
    medications: medicationsError
      ? { status: 'error', retry: refreshMedications }
      : medicationsLoading
        ? { status: 'loading' }
        : { status: 'ready', items: medications, stockByMedication },
    hasActionError,
    dismissActionError: clearActionError,
    markTaken: (occurrence) => performDoseAction(occurrence, 'taken'),
    skip: (occurrence) => performDoseAction(occurrence, 'skipped'),
    takeEarly: (occurrence) => performDoseAction(occurrence, 'taken'),
    togglingMedicationId,
    hasToggleError: toggleError !== null,
    dismissToggleError: clearToggleError,
    toggleMedication: (medication) => void performToggle(medication.id, !medication.active),
    editProfile: () => router.push(`/profile/${profile.id}/edit`),
    // replace, not push: History's "Visão geral" tab replaces back to
    // this route too, so switching tabs never stacks duplicate screens.
    openHistory: () => router.replace(`/profile/${profile.id}/history`),
    addMedication: () => router.push({ pathname: '/medication/new', params: { profileId: profile.id } }),
    editMedication: (medicationId) => router.push(`/medication/${medicationId}/edit`),
    updateStock: (medicationId) => router.push(`/medication/${medicationId}/stock`),
  };
}
