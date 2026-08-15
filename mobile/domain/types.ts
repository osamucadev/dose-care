export type ProfileType = 'child' | 'adult' | 'elderly' | 'pet' | 'plant';

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  avatar: string;
  color: string;
  notes: string | null;
  createdAt: string;
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string | null;
  quantityPerDose: string | null;
  notes: string | null;
  /** Fixed daily times, e.g. ["08:00", "20:00"]. Always sorted ascending. */
  times: string[];
  /** Local calendar date (YYYY-MM-DD) the routine starts being active. */
  startDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DoseEventStatus = 'taken' | 'skipped';

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
  /** Local datetime (YYYY-MM-DDTHH:mm) this event answers for. */
  scheduledAt: string;
  /** Local datetime (YYYY-MM-DDTHH:mm) the action was actually performed. */
  occurredAt: string;
  status: DoseEventStatus;
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
  /** Local datetime (YYYY-MM-DDTHH:mm) this dose is expected. */
  scheduledAt: string;
  status: DoseOccurrenceStatus;
  event: DoseEvent | null;
}
