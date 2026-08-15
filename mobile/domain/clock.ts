import { toLocalDateString } from './datetime';

/**
 * Milliseconds from `now` until the exact start of the next minute
 * (seconds=0, ms=0) — used to align a timer with real minute
 * boundaries instead of just counting 60s from whenever it happened to
 * start.
 */
export function msUntilNextMinute(now: Date): number {
  const msIntoCurrentMinute = now.getSeconds() * 1000 + now.getMilliseconds();
  return 60_000 - msIntoCurrentMinute;
}

/** True if `now`'s local calendar date differs from `previousDateStr` (YYYY-MM-DD). */
export function hasLocalDateChanged(previousDateStr: string, now: Date): boolean {
  return toLocalDateString(now) !== previousDateStr;
}

/**
 * True when an AppState transition represents the app returning to the
 * foreground (from "background"/"inactive"/anything else, into
 * "active") — the moment cached data may be stale because the device
 * could have sat untouched for minutes or hours. Kept as a plain
 * string-in/string-out function (not importing React Native's
 * `AppStateStatus` type) so the domain layer stays framework-free;
 * `AppStateStatus` values are plain strings and pass in directly.
 */
export function didReturnToForeground(previousState: string, nextState: string): boolean {
  return previousState !== 'active' && nextState === 'active';
}
