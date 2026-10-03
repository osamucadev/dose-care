import { parseScheduledLocalDateTime } from './datetime';
import type { DoseOccurrence } from './types';

/**
 * How many days ahead local reminders are scheduled. The OS only holds
 * what was handed to it, so the plan is refreshed every time the app
 * opens or a routine/dose changes; this window is how long reminders
 * keep arriving if the app is not opened at all in the meantime.
 */
export const REMINDER_WINDOW_DAYS = 7;

/**
 * Upper bound on scheduled reminders. iOS silently drops anything past
 * 64 pending local notifications, so staying below it keeps both
 * platforms behaving the same (Android has no such cap).
 */
export const MAX_SCHEDULED_REMINDERS = 60;

export interface ReminderPlanItem {
  /** Stable per occurrence, so a re-sync replaces rather than duplicates. */
  id: string;
  profileId: string;
  fireAt: Date;
  title: string;
  body: string;
}

/**
 * Gentle reminder text, never phrased as a failure (SPEC §47):
 * "Está na hora: Vitamina C 500 mg · 1 comprimido."
 */
export function reminderBody(occurrence: Pick<DoseOccurrence, 'medicationName' | 'dosage' | 'quantityPerDose'>): string {
  const what = occurrence.dosage ? `${occurrence.medicationName} ${occurrence.dosage}` : occurrence.medicationName;
  return occurrence.quantityPerDose ? `Está na hora: ${what} · ${occurrence.quantityPerDose}.` : `Está na hora: ${what}.`;
}

/**
 * Picks which occurrences should become OS-scheduled reminders: only
 * still-pending doses strictly in the future, of profiles that are
 * still listed (`profileNameById` holds active profiles only), earliest
 * first, capped at `limit`. A dose whose time has already passed is
 * never re-notified; it simply stays on the Agora card.
 */
export function planReminders(
  occurrences: DoseOccurrence[],
  profileNameById: Record<string, string>,
  now: Date,
  limit: number = MAX_SCHEDULED_REMINDERS
): ReminderPlanItem[] {
  return occurrences
    .filter((o) => o.status === 'pending' && profileNameById[o.profileId] !== undefined)
    .map((o) => ({ occurrence: o, fireAt: parseScheduledLocalDateTime(o.scheduledAt) }))
    .filter(({ fireAt }) => fireAt > now)
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, limit)
    .map(({ occurrence, fireAt }) => ({
      id: `dose_${occurrence.id}`,
      profileId: occurrence.profileId,
      fireAt,
      title: profileNameById[occurrence.profileId],
      body: reminderBody(occurrence),
    }));
}
