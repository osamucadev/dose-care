const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTimeString(value: string): boolean {
  return TIME_RE.test(value);
}

export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

/** "YYYY-MM-DD" using the device's local calendar date, never UTC. */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** "HH:mm" using the device's local wall clock time. */
export function toLocalTimeString(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * Combines a local calendar date and a fixed HH:mm time into the
 * "YYYY-MM-DDTHH:mm" wall-clock string used to identify a dose occurrence.
 * This is intentionally not a UTC ISO string: it represents local time
 * exactly as scheduled, independent of the device's timezone offset.
 */
export function combineLocalDateTime(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}`;
}

/** Full-precision local timestamp, used for occurredAt/createdAt. */
export function nowLocalTimestamp(now: Date = new Date()): string {
  return `${toLocalDateString(now)}T${toLocalTimeString(now)}:${pad2(now.getSeconds())}`;
}

/**
 * Parses a "YYYY-MM-DDTHH:mm" (or with seconds) local wall-clock string
 * back into a Date, constructed from local components so it round-trips
 * correctly regardless of the device's timezone.
 */
export function parseLocalDateTime(value: string): Date {
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second ?? 0);
}

export function isValidLocalDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function compareTimeStrings(a: string, b: string): number {
  return a.localeCompare(b);
}
