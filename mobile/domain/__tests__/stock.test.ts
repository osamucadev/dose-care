import { computeStockStatus, needsRestock, stockLevel } from '../stock';
import type { StockCount } from '../types';

const count = (dosesOnHand: number): StockCount => ({
  id: 'count-1',
  medicationId: 'med-1',
  dosesOnHand,
  countedAt: '2026-10-01T12:00:00.000Z',
  createdAt: '2026-10-01T12:00:00.000Z',
});

describe('stockLevel', () => {
  it.each([
    [30, 30, 'ok'],
    [4, 30, 'ok'],
    [3, 30, 'low'],
    [2, 30, 'low'],
    [1, 30, 'critical'],
    [0, 30, 'out'],
    [5, 100, 'critical'],
    [10, 100, 'low'],
    [11, 100, 'ok'],
  ] as const)('%i of %i doses is %s', (remaining, base, level) => {
    expect(stockLevel(remaining, base)).toBe(level);
  });

  it('treats a count of zero as out of stock', () => {
    expect(stockLevel(0, 0)).toBe('out');
  });
});

describe('computeStockStatus', () => {
  it('subtracts the doses taken since the count', () => {
    expect(computeStockStatus(count(30), 12, 2)).toEqual({ base: 30, remaining: 18, level: 'ok', daysLeft: 9 });
  });

  it('never goes below zero', () => {
    expect(computeStockStatus(count(5), 8, 1)).toMatchObject({ remaining: 0, level: 'out', daysLeft: 0 });
  });

  it('has no day estimate without a schedule', () => {
    expect(computeStockStatus(count(10), 0, 0).daysLeft).toBeNull();
  });

  it('flags every level below ok as needing restock', () => {
    expect(needsRestock(computeStockStatus(count(30), 27, 1))).toBe(true);
    expect(needsRestock(computeStockStatus(count(30), 26, 1))).toBe(false);
  });
});
