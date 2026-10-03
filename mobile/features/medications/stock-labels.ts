import type { StockLevel, StockStatus } from '@/domain/stock';

function doses(n: number): string {
  return n === 1 ? '1 dose' : `${n} doses`;
}

/** "12 doses em estoque · cerca de 6 dias", or just the doses without a schedule. */
export function stockSummary(status: StockStatus): string {
  const onHand = `${doses(status.remaining)} em estoque`;
  if (status.daysLeft === null || status.remaining === 0) return onHand;
  if (status.daysLeft === 0) return `${onHand} · menos de 1 dia`;
  return `${onHand} · cerca de ${status.daysLeft === 1 ? '1 dia' : `${status.daysLeft} dias`}`;
}

/** Badge text for stock that needs restocking; null while it is fine. Calm wording, never alarming. */
export function restockBadgeLabel(level: StockLevel): string | null {
  switch (level) {
    case 'low':
      return 'Estoque baixo';
    case 'critical':
      return 'Quase acabando';
    case 'out':
      return 'Estoque esgotado';
    default:
      return null;
  }
}
