/** Extracts the "HH:mm" portion of a "YYYY-MM-DDTHH:mm" local datetime string. */
export function doseTimeLabel(scheduledAt: string): string {
  return scheduledAt.split('T')[1] ?? scheduledAt;
}
