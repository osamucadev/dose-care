import type { SQLiteDatabase } from 'expo-sqlite';

import type { DoseEvent } from '@/domain/types';
import { assertValidDoseEvent, type DoseEventCandidate } from '@/domain/validation';

interface DoseEventRow {
  id: string;
  profile_id: string;
  medication_id: string;
  medication_name_snapshot: string;
  dosage_snapshot: string | null;
  quantity_snapshot: string | null;
  scheduled_at: string;
  occurred_at: string;
  status: string;
  created_at: string;
}

function toDoseEvent(row: DoseEventRow): DoseEvent {
  const candidate: DoseEventCandidate = {
    id: row.id,
    profileId: row.profile_id,
    medicationId: row.medication_id,
    medicationNameSnapshot: row.medication_name_snapshot,
    dosageSnapshot: row.dosage_snapshot,
    quantitySnapshot: row.quantity_snapshot,
    scheduledAt: row.scheduled_at,
    occurredAt: row.occurred_at,
    status: row.status,
    createdAt: row.created_at,
  };

  // Same validator used before INSERT (see create() below) — a
  // corrupted row is caught the moment it is read, not trusted just
  // because it made it into the database.
  assertValidDoseEvent(candidate);
  return candidate;
}

/**
 * Thrown when an occurrence already has a recorded event — either a
 * genuine double action (two taps before the UI could refresh) or a
 * retry after the network/DB hiccuped. Phrased gently on purpose: this
 * is informational, not a failure the user caused.
 */
export class DoseAlreadyResolvedError extends Error {
  constructor() {
    super('Essa dose já foi registrada — nada a fazer por aqui.');
    this.name = 'DoseAlreadyResolvedError';
  }
}

export class DoseEventRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /** Full history for a profile, most recent action first. */
  async listByProfile(profileId: string): Promise<DoseEvent[]> {
    const rows = await this.db.getAllAsync<DoseEventRow>(
      'SELECT * FROM dose_events WHERE profile_id = ? ORDER BY occurred_at DESC;',
      profileId
    );
    return rows.map(toDoseEvent);
  }

  /** Events scheduled on a given local date (YYYY-MM-DD), any profile. */
  async listForDate(dateStr: string): Promise<DoseEvent[]> {
    const rows = await this.db.getAllAsync<DoseEventRow>(
      "SELECT * FROM dose_events WHERE scheduled_at LIKE ?;",
      `${dateStr}T%`
    );
    return rows.map(toDoseEvent);
  }

  /**
   * Inserts a dose event. `assertValidDoseEvent` runs first — before
   * any SQL — so a malformed event never reaches the database; TypeScript
   * alone isn't trusted here, since `event` could originate from a
   * caller that bypassed the type system (or from stale/corrupted state).
   * The UNIQUE(medication_id, scheduled_at) constraint (see
   * migrations/001_initial.ts) remains the last line of defense against
   * a duplicate registration for the same occurrence — the UI is
   * expected to already prevent this via the synchronous lock in
   * `useDoseActionHandler`, but the constraint keeps that a guarantee,
   * not just a convention.
   */
  async create(event: DoseEvent): Promise<void> {
    assertValidDoseEvent(event);

    try {
      await this.db.runAsync(
        `INSERT INTO dose_events
          (id, profile_id, medication_id, medication_name_snapshot, dosage_snapshot, quantity_snapshot, scheduled_at, occurred_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        event.id,
        event.profileId,
        event.medicationId,
        event.medicationNameSnapshot,
        event.dosageSnapshot,
        event.quantitySnapshot,
        event.scheduledAt,
        event.occurredAt,
        event.status,
        event.createdAt
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new DoseAlreadyResolvedError();
      }
      throw error;
    }
  }
}
