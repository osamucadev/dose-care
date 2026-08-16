import type { Medication } from '@/domain/types';

/** "Contínuo" / "Até DD/MM/AAAA" / "N doses programadas" for the medication card — no calculation detail. */
export function formatTreatmentEndSummary(
  medication: Pick<Medication, 'endMode' | 'endDate' | 'totalScheduledDoses'>
): string {
  if (medication.endMode === 'end_date' && medication.endDate) {
    const [year, month, day] = medication.endDate.split('-');
    return `Até ${day}/${month}/${year}`;
  }
  if (medication.endMode === 'dose_count' && medication.totalScheduledDoses !== null) {
    const count = medication.totalScheduledDoses;
    return `${count} dose${count === 1 ? '' : 's'} programada${count === 1 ? '' : 's'}`;
  }
  return 'Contínuo';
}
