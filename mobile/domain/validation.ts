import {
  isValidLocalDateString,
  isValidScheduledLocalDateTime,
  isValidTimeString,
  isValidUtcIsoTimestamp,
} from './datetime';
import { DOSE_EVENT_STATUS_VALUES, PROFILE_TYPE_VALUES } from './types';
import type { DoseEvent, DoseEventStatus, ProfileType } from './types';

/**
 * Thrown when data read back from SQLite (or about to be written to it)
 * fails to satisfy the domain's invariants. Repositories/services must
 * not trust the database or the caller blindly — the UI's Zod
 * validation is a courtesy, not the only line of defense.
 */
export class InvalidPersistedDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPersistedDataError';
  }
}

export function isValidProfileType(value: string): value is ProfileType {
  return (PROFILE_TYPE_VALUES as readonly string[]).includes(value);
}

export function isValidDoseEventStatus(value: string): value is DoseEventStatus {
  return (DOSE_EVENT_STATUS_VALUES as readonly string[]).includes(value);
}

/**
 * Safely parses a medication's persisted `times` JSON column: verifies
 * it is a JSON array of valid, unique "HH:mm" strings and returns them
 * sorted. Throws InvalidPersistedDataError on any corrupted shape
 * instead of letting a raw JSON.parse/runtime error leak out of the
 * repository layer.
 */
export function parseMedicationTimes(raw: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InvalidPersistedDataError('Medication.times is not valid JSON.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new InvalidPersistedDataError('Medication.times must be a non-empty array.');
  }

  const times = new Set<string>();
  for (const value of parsed) {
    if (typeof value !== 'string' || !isValidTimeString(value)) {
      throw new InvalidPersistedDataError(`Medication.times contains an invalid time: ${JSON.stringify(value)}.`);
    }
    times.add(value);
  }

  return Array.from(times).sort();
}

export interface MedicationInputToValidate {
  name: string;
  times: string[];
  startDate: string;
}

/**
 * Validates a medication routine's editable fields before they are
 * persisted, and returns the times normalized (deduplicated + sorted).
 * This runs in the repository layer regardless of the form's Zod
 * schema — repositories/services must not depend solely on the UI to
 * hand them valid data.
 */
export function assertValidMedicationInput(input: MedicationInputToValidate): string[] {
  if (input.name.trim().length === 0) {
    throw new InvalidPersistedDataError('Medication name is required.');
  }
  if (input.times.length === 0) {
    throw new InvalidPersistedDataError('At least one time is required.');
  }

  const times = new Set<string>();
  for (const time of input.times) {
    if (!isValidTimeString(time)) {
      throw new InvalidPersistedDataError(`Invalid time: ${time}.`);
    }
    times.add(time);
  }

  if (!isValidLocalDateString(input.startDate)) {
    throw new InvalidPersistedDataError(`Invalid start date: ${input.startDate}.`);
  }

  return Array.from(times).sort();
}

export interface ProfileInputToValidate {
  name: string;
  type: string;
}

export function assertValidProfileInput(input: ProfileInputToValidate): void {
  if (input.name.trim().length === 0) {
    throw new InvalidPersistedDataError('Profile name is required.');
  }
  if (!isValidProfileType(input.type)) {
    throw new InvalidPersistedDataError(`Invalid profile type: ${input.type}.`);
  }
}

/**
 * Shape-only version of `DoseEvent` used as `assertValidDoseEvent`'s
 * input: every field matches, except `status` is a plain `string` —
 * a raw SQLite row (or any not-yet-trusted candidate) has no
 * `DoseEventStatus` guarantee until the assertion below passes.
 */
export interface DoseEventCandidate {
  id: string;
  profileId: string;
  medicationId: string;
  medicationNameSnapshot: string;
  dosageSnapshot: string | null;
  quantitySnapshot: string | null;
  scheduledAt: string;
  occurredAt: string;
  status: string;
  createdAt: string;
}

/**
 * The single source of truth for what makes a DoseEvent well-formed.
 * Used on BOTH the write path (`DoseEventRepository.create`, before any
 * SQL runs) and the read path (mapping a persisted row back to a
 * `DoseEvent`), so a corrupted row is caught the moment it is read, not
 * just when it was written. Throws `InvalidPersistedDataError` naming
 * the offending field; never coerces or silently accepts a value that
 * merely resembles the right shape (e.g. a scheduledAt with an
 * impossible calendar date, or a UTC timestamp missing its "Z").
 */
export function assertValidDoseEvent(event: DoseEventCandidate): asserts event is DoseEvent {
  if (event.id.trim().length === 0) {
    throw new InvalidPersistedDataError('DoseEvent.id must not be empty.');
  }
  if (event.profileId.trim().length === 0) {
    throw new InvalidPersistedDataError('DoseEvent.profileId must not be empty.');
  }
  if (event.medicationId.trim().length === 0) {
    throw new InvalidPersistedDataError('DoseEvent.medicationId must not be empty.');
  }
  if (event.medicationNameSnapshot.trim().length === 0) {
    throw new InvalidPersistedDataError('DoseEvent.medicationNameSnapshot must not be empty.');
  }
  if (!isValidDoseEventStatus(event.status)) {
    throw new InvalidPersistedDataError(`DoseEvent.status is invalid: ${event.status}.`);
  }
  if (!isValidScheduledLocalDateTime(event.scheduledAt)) {
    throw new InvalidPersistedDataError(`DoseEvent.scheduledAt is invalid: ${event.scheduledAt}.`);
  }
  if (!isValidUtcIsoTimestamp(event.occurredAt)) {
    throw new InvalidPersistedDataError(`DoseEvent.occurredAt is invalid: ${event.occurredAt}.`);
  }
  if (!isValidUtcIsoTimestamp(event.createdAt)) {
    throw new InvalidPersistedDataError(`DoseEvent.createdAt is invalid: ${event.createdAt}.`);
  }
}
