import {
  addDaysToLocalDateString,
  daysBetweenLocalDates,
  parseScheduledLocalDateTime,
  toLocalDateString,
  toScheduledLocalDateTime,
} from './datetime';
import type { DoseEvent, DoseOccurrence, Medication } from './types';

/**
 * The 0-based ordinal position a fixed time occupies in a medication's
 * overall dose schedule, counting every fixed time on every day since
 * `startDate`: day 0's first time is ordinal 0, its second time is
 * ordinal 1, day 1's first time is ordinal `timesPerDay`, and so on.
 * Used to decide whether a given occurrence is still within a
 * `dose_count`-limited treatment's total — a skipped dose still
 * consumes its ordinal, nothing here creates a replacement for it.
 *
 * `timeIndex` must be the time's index within `Medication.times`
 * (already sorted ascending), so ordinals within a day increase with
 * time-of-day.
 */
export function scheduledDoseOrdinal(
  startDateStr: string,
  dateStr: string,
  timeIndex: number,
  timesPerDay: number
): number {
  const daysSinceStart = daysBetweenLocalDates(startDateStr, dateStr);
  return daysSinceStart * timesPerDay + timeIndex;
}

export interface DoseCountDurationEstimate {
  /** Calendar days the treatment spans — the last day may have fewer than `timesPerDay` occurrences. */
  days: number;
  /** True when `totalScheduledDoses` divides evenly into `timesPerDay` (every day, including the last, is fully occupied). */
  exact: boolean;
  /** How many occurrences land on the final day (always between 1 and `timesPerDay`). */
  dosesOnLastDay: number;
}

/**
 * Organizational estimate only — never a medical recommendation.
 * E.g. 60 scheduled doses at 2 fixed times/day span roughly 30 days.
 * When `totalScheduledDoses` isn't an exact multiple of `timesPerDay`,
 * `exact` is false and the caller should say so: the last day only
 * gets `dosesOnLastDay` of the treatment's occurrences, not a full day.
 */
export function estimateDoseCountDuration(
  totalScheduledDoses: number,
  timesPerDay: number
): DoseCountDurationEstimate {
  const days = Math.ceil(totalScheduledDoses / timesPerDay);
  const dosesOnLastDay = totalScheduledDoses - (days - 1) * timesPerDay;
  return { days, exact: dosesOnLastDay === timesPerDay, dosesOnLastDay };
}

/**
 * Builds the doses expected on `dateStr` for the given medications.
 * Only active medications whose startDate has already begun, and whose
 * treatment-end configuration still covers `dateStr`, produce
 * occurrences — this list is never persisted, it is recomputed from the
 * Medication config plus whatever DoseEvents already exist for that day.
 *
 * Treatment end modes:
 * - `ongoing`: no upper bound, unchanged behavior.
 * - `end_date`: no occurrences after `endDate` — `dateStr === endDate`
 *   still generates normally (inclusive).
 * - `dose_count`: only the first `totalScheduledDoses` ordinal
 *   positions (see `scheduledDoseOrdinal`) generate; this is computed
 *   directly from the date, never by walking every day since
 *   `startDate`, so a start date far in the past stays cheap.
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
    if (medication.endMode === 'end_date' && medication.endDate !== null && dateStr > medication.endDate) {
      continue;
    }

    for (let timeIndex = 0; timeIndex < medication.times.length; timeIndex++) {
      if (medication.endMode === 'dose_count' && medication.totalScheduledDoses !== null) {
        const ordinal = scheduledDoseOrdinal(medication.startDate, dateStr, timeIndex, medication.times.length);
        if (ordinal >= medication.totalScheduledDoses) continue;
      }

      const time = medication.times[timeIndex];
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
        allowEarly: medication.allowEarly,
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
  /** Every other still-pending dose scheduled later *today* (strictly in the future), excluding `next`. */
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
 * - `upcomingToday` lists the other still-pending doses scheduled
 *   later *today*: strictly in the future, excluding `next`, so the
 *   "Próximos" list never repeats the highlighted cards and never
 *   presents a dose whose time already passed as upcoming. Overdue
 *   doses besides `now` are not listed; each one becomes `now` in turn
 *   once the older one is resolved.
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
  const upcomingToday = filterTodayOccurrences(strictlyFuture, todayStr).filter((o) => !highlightedIds.has(o.id));

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

/**
 * Whether a dose that is not due yet can be taken now ("Tomar agora").
 * Only when the user allowed it for that medication, only on the same
 * local day, and only for the next pending dose of that medication: an
 * earlier one still pending comes first, so two doses of the same
 * medication are never recorded out of order. A dose already due is not
 * "early"; it is in Agora with the regular actions.
 */
export function canTakeEarly(occurrence: DoseOccurrence, occurrences: DoseOccurrence[], now: Date): boolean {
  if (!occurrence.allowEarly || occurrence.status !== 'pending') return false;
  if (parseScheduledLocalDateTime(occurrence.scheduledAt) <= now) return false;
  if (!occurrence.scheduledAt.startsWith(`${toLocalDateString(now)}T`)) return false;
  return !occurrences.some(
    (other) =>
      other.medicationId === occurrence.medicationId &&
      other.status === 'pending' &&
      other.scheduledAt < occurrence.scheduledAt
  );
}

/** Ids of the occurrences in `occurrences` that `canTakeEarly` allows right now. */
export function earlyTakeableIds(occurrences: DoseOccurrence[], now: Date): ReadonlySet<string> {
  return new Set(occurrences.filter((o) => canTakeEarly(o, occurrences, now)).map((o) => o.id));
}
