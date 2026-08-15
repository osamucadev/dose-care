/**
 * Extracts the "HH:mm" portion of a scheduledAt-shaped local datetime
 * string ("YYYY-MM-DDTHH:mm"). Not for UTC timestamps like occurredAt —
 * use `formatUtcIsoToLocalTime` from `domain/datetime.ts` for those.
 */
export function doseTimeLabel(scheduledAt: string): string {
  return scheduledAt.split('T')[1] ?? scheduledAt;
}

/**
 * Same as `doseTimeLabel`, but prefixes "amanhã" when the occurrence's
 * date differs from `todayStr`. The "Próximo" dose can now legitimately
 * fall on the next day (see `domain/occurrences.ts#computeNowAndNext`),
 * so callers that surface it must say so — a bare "08:00" would read as
 * today's dose otherwise.
 */
export function doseDayTimeLabel(scheduledAt: string, todayStr: string): string {
  const [datePart] = scheduledAt.split('T');
  const time = doseTimeLabel(scheduledAt);
  return datePart === todayStr ? time : `amanhã · ${time}`;
}
