import type { DoseEvent, DoseEventStatus, DoseOccurrence } from './types';

/**
 * Builds the immutable event that records an action taken on an
 * occurrence. Snapshots the medication fields as they are right now, so
 * later renaming/editing the medication never rewrites this entry.
 * id/occurredAt are injected instead of generated here to keep this
 * function pure and independently testable — `occurredAt` is expected
 * to be a UTC ISO 8601 timestamp (see `domain/datetime.ts#nowUtcIso`),
 * while `occurrence.scheduledAt` stays a local civil-time string.
 */
export function createDoseEventFromOccurrence(
  occurrence: DoseOccurrence,
  status: DoseEventStatus,
  params: { id: string; occurredAt: string }
): DoseEvent {
  return {
    id: params.id,
    profileId: occurrence.profileId,
    medicationId: occurrence.medicationId,
    medicationNameSnapshot: occurrence.medicationName,
    dosageSnapshot: occurrence.dosage,
    quantitySnapshot: occurrence.quantityPerDose,
    scheduledAt: occurrence.scheduledAt,
    occurredAt: params.occurredAt,
    status,
    createdAt: params.occurredAt,
  };
}
