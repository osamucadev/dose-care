import type { SQLiteDatabase } from 'expo-sqlite';

import type { DoseEvent } from '@/domain/types';

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
  return {
    id: row.id,
    profileId: row.profile_id,
    medicationId: row.medication_id,
    medicationNameSnapshot: row.medication_name_snapshot,
    dosageSnapshot: row.dosage_snapshot,
    quantitySnapshot: row.quantity_snapshot,
    scheduledAt: row.scheduled_at,
    occurredAt: row.occurred_at,
    status: row.status as DoseEvent['status'],
    createdAt: row.created_at,
  };
}

/** Thrown when an occurrence already has a recorded event (double action). */
export class DoseAlreadyResolvedError extends Error {
  constructor() {
    super('Esta dose já foi registrada.');
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

  async create(event: DoseEvent): Promise<void> {
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
