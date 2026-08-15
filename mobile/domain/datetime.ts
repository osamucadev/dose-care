const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTimeString(value: string): boolean {
  return TIME_RE.test(value);
}

export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

// ---------------------------------------------------------------------
// Local calendar date — "YYYY-MM-DD". Used for Medication.startDate and
// as the day component of a scheduledAt.
// ---------------------------------------------------------------------

/** "YYYY-MM-DD" using the device's local calendar date, never UTC. */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function isValidLocalDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** Adds (or subtracts, if negative) whole days to a local "YYYY-MM-DD" date string. */
export function addDaysToLocalDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return toLocalDateString(new Date(year, month - 1, day + days));
}

// ---------------------------------------------------------------------
// Local wall-clock time — "HH:mm". Used for Medication.times entries.
// ---------------------------------------------------------------------

/** "HH:mm" using the device's local wall clock time. */
export function toLocalTimeString(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function compareTimeStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

// ---------------------------------------------------------------------
// Scheduled local datetime — "YYYY-MM-DDTHH:mm". This is DoseOccurrence
// /DoseEvent.scheduledAt: a fixed civil-time instant ("08:00 local"),
// deliberately never converted to/from UTC. Two devices in different
// timezones reading the same scheduledAt both see "08:00" — that is the
// intended behavior for a routine tied to the device's current locale,
// not a single global instant.
// ---------------------------------------------------------------------

/** Combines a local calendar date and a fixed "HH:mm" time into a scheduledAt string. */
export function toScheduledLocalDateTime(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}`;
}

/**
 * Parses a scheduledAt-shaped "YYYY-MM-DDTHH:mm" (or with seconds)
 * local wall-clock string back into a Date, built from local components
 * so it round-trips correctly regardless of the device's timezone. Do
 * NOT use this to parse a UTC ISO timestamp (e.g. occurredAt) — use
 * `new Date(isoUtc)` for those instead.
 */
export function parseScheduledLocalDateTime(value: string): Date {
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second ?? 0);
}

/**
 * Strictly validates the canonical scheduledAt shape "YYYY-MM-DDTHH:mm"
 * (no seconds) — both that it matches the pattern AND that the date and
 * time it names are real (rejects e.g. "2026-02-30T08:00" or
 * "2026-08-15T25:61", which merely look right). Used to validate a
 * DoseEvent before it is persisted or trusted after being read back.
 */
export function isValidScheduledLocalDateTime(value: string): boolean {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
  if (!match) return false;
  const [, datePart, timePart] = match;
  return isValidLocalDateString(datePart) && isValidTimeString(timePart);
}

// ---------------------------------------------------------------------
// UTC timestamp — full ISO 8601 with offset "Z". Used for audit fields
// that record a real instant in time: DoseEvent.occurredAt/createdAt,
// Profile.createdAt, Medication.createdAt/updatedAt. Unlike scheduledAt,
// these must be unambiguous instants, so they are never local.
// ---------------------------------------------------------------------

/** The current instant as a UTC ISO 8601 timestamp, e.g. "2026-08-15T11:03:12.345Z". */
export function nowUtcIso(now: Date = new Date()): string {
  return now.toISOString();
}

/** Formats a UTC ISO timestamp (e.g. occurredAt) as "HH:mm" in the device's local timezone, for display. */
export function formatUtcIsoToLocalTime(utcIso: string): string {
  return toLocalTimeString(new Date(utcIso));
}

const UTC_ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?Z$/;

/**
 * Strictly validates a full UTC ISO 8601 timestamp with an explicit "Z"
 * offset (the shape `nowUtcIso` produces) — both the pattern AND that
 * the date/time it names are real, rejecting values like
 * "2026-02-30T10:00:00.000Z" or "2026-08-15T25:00:00Z" that merely look
 * like a timestamp. A bare `new Date(value)` is not used alone here:
 * some JS engines silently roll invalid components over into a nearby
 * valid date instead of rejecting them, which would let corrupted data
 * through unnoticed.
 */
export function isValidUtcIsoTimestamp(value: string): boolean {
  const match = UTC_ISO_RE.exec(value);
  if (!match) return false;

  const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);

  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return false;

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
