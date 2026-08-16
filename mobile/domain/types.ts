export const PROFILE_TYPE_VALUES = ['child', 'adult', 'elderly', 'pet', 'plant'] as const;
export type ProfileType = (typeof PROFILE_TYPE_VALUES)[number];

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  avatar: string;
  color: string;
  notes: string | null;
  /**
   * Soft-delete flag. "Excluir perfil" in the UI only ever flips this
   * to false — the row, its medications and its DoseEvents are never
   * physically removed. Inactive profiles are excluded from the normal
   * profile listing (see ProfileRepository.listAll).
   */
  active: boolean;
  /** UTC ISO 8601 timestamp. */
  createdAt: string;
}

export const TREATMENT_END_MODE_VALUES = ['ongoing', 'end_date', 'dose_count'] as const;
export type TreatmentEndMode = (typeof TREATMENT_END_MODE_VALUES)[number];

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string | null;
  quantityPerDose: string | null;
  notes: string | null;
  /** Fixed daily times, e.g. ["08:00", "20:00"]. Always sorted, deduplicated. */
  times: string[];
  /** Local calendar date (YYYY-MM-DD) the routine starts being active. */
  startDate: string;
  active: boolean;
  /**
   * How the treatment's routine occurrences come to an end:
   * - `ongoing`: no end — endDate and totalScheduledDoses are both null.
   * - `end_date`: occurrences stop after endDate (inclusive) —
   *   totalScheduledDoses is null.
   * - `dose_count`: occurrences stop once totalScheduledDoses
   *   positions have been scheduled (skipped doses still count) —
   *   endDate is null.
   * These three combinations are mutually exclusive; see
   * `domain/validation.ts#assertValidTreatmentEndMode` for the single
   * place that enforces it (SQLite's ALTER TABLE cannot express a
   * cross-column CHECK for this).
   */
  endMode: TreatmentEndMode;
  /** Local calendar date (YYYY-MM-DD), inclusive. Only set when endMode is `end_date`. */
  endDate: string | null;
  /** Positive integer. Only set when endMode is `dose_count`. Counts scheduled doses, not pills/capsules/ml. */
  totalScheduledDoses: number | null;
  /** UTC ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

export const DOSE_EVENT_STATUS_VALUES = ['taken', 'skipped'] as const;
export type DoseEventStatus = (typeof DOSE_EVENT_STATUS_VALUES)[number];

/**
 * The record of an action taken on a dose. This is the only persisted,
 * immutable source of truth for history — it snapshots medication fields
 * at the time of the action so renaming/editing/deactivating the
 * medication later never rewrites the past.
 */
export interface DoseEvent {
  id: string;
  profileId: string;
  medicationId: string;
  medicationNameSnapshot: string;
  dosageSnapshot: string | null;
  quantitySnapshot: string | null;
  /** Scheduled local datetime (YYYY-MM-DDTHH:mm) this event answers for — civil time, not UTC. */
  scheduledAt: string;
  /** UTC ISO 8601 timestamp of when the action was actually performed. */
  occurredAt: string;
  status: DoseEventStatus;
  /** UTC ISO 8601 timestamp. */
  createdAt: string;
}

export type DoseOccurrenceStatus = 'pending' | 'taken' | 'skipped';

/**
 * A dose expected at a specific date/time for a specific medication.
 * Computed on the fly from active Medications (never persisted) and
 * matched against DoseEvents to determine its status.
 */
export interface DoseOccurrence {
  id: string;
  profileId: string;
  medicationId: string;
  medicationName: string;
  dosage: string | null;
  quantityPerDose: string | null;
  /** Scheduled local datetime (YYYY-MM-DDTHH:mm) this dose is expected — civil time, not UTC. */
  scheduledAt: string;
  status: DoseOccurrenceStatus;
  event: DoseEvent | null;
}
