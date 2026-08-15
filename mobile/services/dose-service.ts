import * as Crypto from 'expo-crypto';

import { getRepositories } from '@/database/repositories';
import { toLocalDateString, nowLocalTimestamp } from '@/domain/datetime';
import { createDoseEventFromOccurrence } from '@/domain/dose-events';
import { generateDailyOccurrences } from '@/domain/occurrences';
import type { DoseEvent, DoseEventStatus, DoseOccurrence } from '@/domain/types';

/**
 * Today's expected doses, computed fresh from active medications plus
 * whatever events already exist for today. Pass a profileId to scope to
 * a single profile, or omit it for the aggregated "Todos" view.
 */
export async function getTodayOccurrences(profileId?: string): Promise<DoseOccurrence[]> {
  const { medications, doseEvents } = await getRepositories();
  const dateStr = toLocalDateString(new Date());

  const meds = profileId
    ? await medications.listByProfile(profileId)
    : await medications.listActiveForAllProfiles();

  const events = await doseEvents.listForDate(dateStr);

  return generateDailyOccurrences(meds, dateStr, events);
}

export async function recordDoseAction(
  occurrence: DoseOccurrence,
  status: DoseEventStatus
): Promise<void> {
  const { doseEvents } = await getRepositories();
  const event = createDoseEventFromOccurrence(occurrence, status, {
    id: Crypto.randomUUID(),
    occurredAt: nowLocalTimestamp(),
  });
  await doseEvents.create(event);
}

export async function getHistoryForProfile(profileId: string): Promise<DoseEvent[]> {
  const { doseEvents } = await getRepositories();
  return doseEvents.listByProfile(profileId);
}
