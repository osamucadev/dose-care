import type { StockStatus } from '@/domain/stock';

import { restockBadgeLabel, stockSummary } from '../stock-labels';

const status = (remaining: number, daysLeft: number | null): StockStatus => ({
  base: 30,
  remaining,
  level: 'ok',
  daysLeft,
});

describe('stockSummary', () => {
  it.each([
    [status(12, 6), '12 doses em estoque · cerca de 6 dias'],
    [status(2, 1), '2 doses em estoque · cerca de 1 dia'],
    [status(1, 0), '1 dose em estoque · menos de 1 dia'],
    [status(0, 0), '0 doses em estoque'],
    [status(5, null), '5 doses em estoque'],
  ])('%o reads "%s"', (input, text) => {
    expect(stockSummary(input)).toBe(text);
  });
});

describe('restockBadgeLabel', () => {
  it('only labels stock that needs restocking', () => {
    expect(restockBadgeLabel('ok')).toBeNull();
    expect(restockBadgeLabel('low')).toBe('Estoque baixo');
    expect(restockBadgeLabel('critical')).toBe('Quase acabando');
    expect(restockBadgeLabel('out')).toBe('Estoque esgotado');
  });
});
