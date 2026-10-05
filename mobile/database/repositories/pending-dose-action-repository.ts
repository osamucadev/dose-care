import type { SQLiteDatabase } from 'expo-sqlite';

import { nowUtcIso } from '@/domain/datetime';
import { parseStoredPendingDoseAction, type StoredPendingDoseAction } from '@/domain/validation';

interface PendingRow {
  occurrence_id: string;
  payload: string;
}

export interface StoredPendingRow {
  occurrenceId: string;
  /** Null when the stored payload is corrupted; the row should just be dropped. */
  action: StoredPendingDoseAction | null;
}

/** Storage for the Tomado/Pular waiting in the undo window (see migration 006). Not history. */
export class PendingDoseActionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async save(action: StoredPendingDoseAction): Promise<void> {
    await this.db.runAsync(
      'INSERT OR REPLACE INTO pending_dose_actions (occurrence_id, payload, created_at) VALUES (?, ?, ?);',
      action.occurrence.id,
      JSON.stringify(action),
      nowUtcIso()
    );
  }

  async remove(occurrenceId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM pending_dose_actions WHERE occurrence_id = ?;', occurrenceId);
  }

  /** Oldest first, so leftovers are committed in the order they were tapped. */
  async listAll(): Promise<StoredPendingRow[]> {
    const rows = await this.db.getAllAsync<PendingRow>(
      'SELECT occurrence_id, payload FROM pending_dose_actions ORDER BY created_at ASC;'
    );
    return rows.map((row) => {
      try {
        return { occurrenceId: row.occurrence_id, action: parseStoredPendingDoseAction(row.payload) };
      } catch {
        return { occurrenceId: row.occurrence_id, action: null };
      }
    });
  }
}
