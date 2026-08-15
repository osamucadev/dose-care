import {
  addDaysToLocalDateString,
  parseScheduledLocalDateTime,
  toLocalDateString,
  toScheduledLocalDateTime,
} from './datetime';
import type { DoseEvent, DoseOccurrence, Medication } from './types';

/**
 * Builds the doses expected on `dateStr` for the given medications.
 * Only active medications whose startDate has already begun produce
 * occurrences — this list is never persisted, it is recomputed from the
 * Medication config plus whatever DoseEvents already exist for that day.
 */
export function generateOccurrencesForDate(
  medications: Medication[],
  dateStr: string,
  events: DoseEvent[]
): DoseOccurrence[] {
  const occurrences: DoseOccurrence[] = [];

  for (const medication of medications) {
    if (!medication.active) continue;
    if (medication.startDate > dateStr) continue;

    for (const time of medication.times) {
      const scheduledAt = toScheduledLocalDateTime(dateStr, time);
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

/** Safety cap: this generator is only meant for small, bounded windows (e.g. today + tomorrow). */
const MAX_RANGE_DAYS = 31;

/**
 * Builds the doses expected across a bounded range of local calendar
 * dates (inclusive on both ends), e.g. today through tomorrow. Used
 * instead of `generateOccurrencesForDate` whenever the Home/Profile
 * screens need to look past midnight to find the next dose — the range
 * is always small and explicit, never open-ended.
 */
export function generateOccurrencesForDateRange(
  medications: Medication[],
  startDateStr: string,
  endDateStrInclusive: string,
  events: DoseEvent[]
): DoseOccurrence[] {
  const occurrences: DoseOccurrence[] = [];
  let cursor = startDateStr;
  let iterations = 0;

  while (cursor <= endDateStrInclusive) {
    iterations += 1;
    if (iterations > MAX_RANGE_DAYS) {
      throw new Error(
        `generateOccurrencesForDateRange: range from ${startDateStr} to ${endDateStrInclusive} exceeds the ${MAX_RANGE_DAYS}-day safety cap.`
      );
    }
    occurrences.push(...generateOccurrencesForDate(medications, cursor, events));
    cursor = addDaysToLocalDateString(cursor, 1);
  }

  return occurrences.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

/** Occurrences whose scheduledAt falls on `todayStr` (YYYY-MM-DD), regardless of status. */
export function filterTodayOccurrences(occurrences: DoseOccurrence[], todayStr: string): DoseOccurrence[] {
  const prefix = `${todayStr}T`;
  return occurrences.filter((o) => o.scheduledAt.startsWith(prefix));
}

export interface NowNextResult {
  /** The oldest still-pending dose whose scheduledAt has already arrived (<= now). */
  now: DoseOccurrence | null;
  /** The first still-pending dose strictly in the future (scheduledAt > now) — may be tomorrow. */
  next: DoseOccurrence | null;
  /** Every other still-pending dose scheduled *today*, excluding `now` and `next`. */
  upcomingToday: DoseOccurrence[];
}

/**
 * Determines "Agora" / "Próximo" and the remaining today's pending list:
 *
 * - `now` is the OLDEST still-pending dose whose scheduledAt <= now —
 *   the one that has been waiting longest, if anything is due. There is
 *   no separate "overdue"/"late" state in this MVP: a very late dose is
 *   simply `now`, shown without alarming language.
 * - `next` is the FIRST still-pending dose that is strictly in the
 *   future (scheduledAt > now). This may fall later today or, once
 *   today's doses are all resolved or already surfaced as `now`,
 *   tomorrow — callers must pass in an `occurrences` list that already
 *   covers that lookahead window (see `generateOccurrencesForDateRange`).
 * - `upcomingToday` lists every other still-pending dose scheduled
 *   *today*, excluding whichever occurrence is already shown as `now`
 *   or `next`, so the "Próximas doses de hoje" list never repeats what
 *   the two highlighted cards already display. Other overdue doses
 *   besides `now` can still appear here — they are simply never
 *   labeled "next".
 */
export function computeNowAndNext(occurrences: DoseOccurrence[], now: Date): NowNextResult {
  const todayStr = toLocalDateString(now);
  const pending = occurrences
    .filter((o) => o.status === 'pending')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const due = pending.filter((o) => parseScheduledLocalDateTime(o.scheduledAt) <= now);
  const current = due[0] ?? null;

  const strictlyFuture = pending.filter((o) => parseScheduledLocalDateTime(o.scheduledAt) > now);
  const next = strictlyFuture[0] ?? null;

  const highlightedIds = new Set([current?.id, next?.id].filter((id): id is string => Boolean(id)));
  const upcomingToday = filterTodayOccurrences(pending, todayStr).filter((o) => !highlightedIds.has(o.id));

  return { now: current, next, upcomingToday };
}

export type ProfileDayStatus = 'now' | 'next' | 'ok' | 'none';

/**
 * Drives the profile card status shown on the Home aggregated view.
 * `occurrences` may span more than just today (see `computeNowAndNext`),
 * so `next` here can legitimately point at tomorrow's first dose once
 * today is fully resolved — the card still reads as "Tudo ok" plus a
 * "Próximo" time, never as an empty/urgent state.
 */
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
