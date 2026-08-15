import { combineLocalDateTime, parseLocalDateTime } from './datetime';
import type { DoseEvent, DoseOccurrence, Medication } from './types';

/**
 * Builds the doses expected on `dateStr` for the given medications.
 * Only active medications whose startDate has already begun produce
 * occurrences — this list is never persisted, it is recomputed from the
 * Medication config plus whatever DoseEvents already exist for that day.
 */
export function generateDailyOccurrences(
  medications: Medication[],
  dateStr: string,
  events: DoseEvent[]
): DoseOccurrence[] {
  const occurrences: DoseOccurrence[] = [];

  for (const medication of medications) {
    if (!medication.active) continue;
    if (medication.startDate > dateStr) continue;

    for (const time of medication.times) {
      const scheduledAt = combineLocalDateTime(dateStr, time);
      const event = events.find(
        (e) => e.medicationId === medication.id && e.scheduledAt === scheduledAt
      );

      // Once an event exists, the occurrence must reflect its immutable
      // snapshot, not the medication's current (possibly renamed) fields.
      occurrences.push({
        id: `${medication.id}_${scheduledAt}`,
        profileId: medication.profileId,
        medicationId: medication.id,
        medicationName: event ? event.medicationNameSnapshot : medication.name,
        dosage: event ? event.dosageSnapshot : medication.dosage,
        quantityPerDose: event ? event.quantitySnapshot : medication.quantityPerDose,
        scheduledAt,
        status: event ? event.status : 'pending',
        event: event ?? null,
      });
    }
  }

  return occurrences.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export interface NowNextResult {
  /** The most urgent still-pending dose whose time has already arrived. */
  now: DoseOccurrence | null;
  /** The earliest still-pending dose still ahead in time. */
  next: DoseOccurrence | null;
  /** All still-pending doses for the day, in order, excluding `now`. */
  upcomingToday: DoseOccurrence[];
}

/**
 * Splits a day's occurrences into "Agora" / "Próximo" / rest, gently:
 * a dose whose time has passed is simply the oldest pending one, never
 * flagged as "late" — there is no separate overdue state in the MVP.
 */
export function computeNowAndNext(occurrences: DoseOccurrence[], now: Date): NowNextResult {
  const pending = occurrences
    .filter((o) => o.status === 'pending')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const due = pending.filter((o) => parseLocalDateTime(o.scheduledAt) <= now);
  const current = due[0] ?? null;
  const upcomingToday = pending.filter((o) => o.id !== current?.id);
  const next = upcomingToday[0] ?? null;

  return { now: current, next, upcomingToday };
}

export type ProfileDayStatus = 'now' | 'next' | 'ok' | 'none';

/** Drives the profile card status shown on the Home aggregated view. */
export function computeProfileDayStatus(
  occurrences: DoseOccurrence[],
  now: Date
): ProfileDayStatus {
  if (occurrences.length === 0) return 'none';
  const { now: current, next } = computeNowAndNext(occurrences, now);
  if (current) return 'now';
  if (next) return 'next';
  return 'ok';
}
