import type { StockCount } from './types';

/** At or below this share of the last count, the stock is low and a daily reminder starts. */
export const LOW_STOCK_RATIO = 0.1;
/** At or below this share, the stock is about to run out. */
export const CRITICAL_STOCK_RATIO = 0.05;

export type StockLevel = 'ok' | 'low' | 'critical' | 'out';

export interface StockStatus {
  /** Doses on hand at the last count: the 100% the thresholds refer to. */
  base: number;
  remaining: number;
  level: StockLevel;
  /** Whole days the remaining doses cover at the current schedule, or null without a schedule. */
  daysLeft: number | null;
}

/**
 * Current stock derived from the latest count and the doses taken after
 * it. Skipped doses consume nothing. Never negative: taking more doses
 * than were counted just reads as out of stock.
 */
export function computeStockStatus(count: StockCount, dosesTakenSinceCount: number, dosesPerDay: number): StockStatus {
  const base = count.dosesOnHand;
  const remaining = Math.max(0, base - dosesTakenSinceCount);
  return {
    base,
    remaining,
    level: stockLevel(remaining, base),
    daysLeft: dosesPerDay > 0 ? Math.floor(remaining / dosesPerDay) : null,
  };
}

export function stockLevel(remaining: number, base: number): StockLevel {
  if (remaining <= 0 || base <= 0) return 'out';
  const ratio = remaining / base;
  if (ratio <= CRITICAL_STOCK_RATIO) return 'critical';
  if (ratio <= LOW_STOCK_RATIO) return 'low';
  return 'ok';
}

export function needsRestock(status: StockStatus): boolean {
  return status.level !== 'ok';
}
