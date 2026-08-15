import { toLocalDateString } from '@/domain/datetime';

/** "Hoje" / "Ontem" / "DD/MM/AAAA" for a "YYYY-MM-DDTHH:mm" local datetime. */
export function formatHistoryDate(scheduledAt: string): string {
  const dateStr = scheduledAt.split('T')[0];
  const today = toLocalDateString(new Date());
  const yesterday = toLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterday) return 'Ontem';

  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
