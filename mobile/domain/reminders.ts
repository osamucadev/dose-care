import { parseScheduledLocalDateTime, toLocalDateString } from './datetime';
import { needsRestock, type StockStatus } from './stock';
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

/** Local time of the daily restock reminder: a calm morning moment, not tied to any dose. */
export const RESTOCK_REMINDER_TIME = '09:00';

export interface RestockItem {
  medicationId: string;
  profileId: string;
  medicationName: string;
  dosage: string | null;
  status: StockStatus;
}

function doseCountLabel(n: number): string {
  return n === 1 ? '1 dose' : `${n} doses`;
}

/**
 * Restock reminder text. Informative, never alarming: running low is
 * something to plan for, not a failure.
 */
export function restockBody(item: RestockItem, profileName: string): string {
  const what = item.dosage ? `${item.medicationName} ${item.dosage}` : item.medicationName;
  if (item.status.level === 'out') {
    return `O estoque de ${what} (${profileName}) acabou. Quando comprar, registre no app.`;
  }
  return `Restam ${doseCountLabel(item.status.remaining)} de ${what} (${profileName}). Que tal providenciar mais?`;
}

/**
 * One reminder per day at `RESTOCK_REMINDER_TIME` for every medication at
 * or below the low-stock threshold, for each of the next `days` days
 * (starting today if that time has not passed yet). Any stock change
 * triggers a new sync, so these stop as soon as a refill is recorded.
 */
export function planRestockReminders(
  items: RestockItem[],
  profileNameById: Record<string, string>,
  now: Date,
  days: number = REMINDER_WINDOW_DAYS
): ReminderPlanItem[] {
  const [hour, minute] = RESTOCK_REMINDER_TIME.split(':').map(Number);
  const firstOffset = now < new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute) ? 0 : 1;
  const plan: ReminderPlanItem[] = [];

  for (const item of items) {
    const profileName = profileNameById[item.profileId];
    if (profileName === undefined || !needsRestock(item.status)) continue;
    for (let offset = firstOffset; offset < firstOffset + days; offset++) {
      const fireAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
      plan.push({
        id: `restock_${item.medicationId}_${toLocalDateString(fireAt)}`,
        profileId: item.profileId,
        fireAt,
        title: `Estoque de ${item.medicationName}`,
        body: restockBody(item, profileName),
      });
    }
  }
  return plan;
}

/** Dose and restock reminders together, earliest first, within the OS limit. */
export function mergeReminderPlans(
  plans: ReminderPlanItem[][],
  limit: number = MAX_SCHEDULED_REMINDERS
): ReminderPlanItem[] {
  return plans
    .flat()
    .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
    .slice(0, limit);
}

/**
 * How many days before the last scheduled reminder the app asks to be
 * opened. Opening it re-syncs and pushes the whole schedule forward, so
 * someone who opens the app regularly never sees these.
 */
export const RENEWAL_DAYS_BEFORE_END = [3, 2, 1] as const;

function shortDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * "Open the app" reminders near the end of what is scheduled, at
 * `RESTOCK_REMINDER_TIME` on each of `RENEWAL_DAYS_BEFORE_END` days
 * before the day of `lastReminderAt`. Only future ones are kept.
 */
export function planRenewalReminders(lastReminderAt: Date, now: Date): ReminderPlanItem[] {
  const [hour, minute] = RESTOCK_REMINDER_TIME.split(':').map(Number);
  return RENEWAL_DAYS_BEFORE_END.map((daysBefore) => ({
    id: `renewal_${daysBefore}`,
    profileId: '',
    fireAt: new Date(
      lastReminderAt.getFullYear(),
      lastReminderAt.getMonth(),
      lastReminderAt.getDate() - daysBefore,
      hour,
      minute
    ),
    title: 'DoseCare',
    body: `Seus lembretes estão programados até ${shortDate(lastReminderAt)}. Abra o DoseCare para programar os próximos dias.`,
  })).filter((item) => item.fireAt > now);
}

/**
 * Everything to hand to the OS: dose and restock reminders, earliest
 * first, plus the renewal reminders computed from the last of them.
 * Slots for the renewals are reserved inside `limit`, because when the
 * cap cuts the schedule short its real end is earlier than the window.
 */
export function buildReminderSchedule(
  plans: ReminderPlanItem[][],
  now: Date,
  limit: number = MAX_SCHEDULED_REMINDERS
): ReminderPlanItem[] {
  const reminders = mergeReminderPlans(plans, limit - RENEWAL_DAYS_BEFORE_END.length);
  const last = reminders[reminders.length - 1];
  return last ? [...reminders, ...planRenewalReminders(last.fireAt, now)] : reminders;
}
