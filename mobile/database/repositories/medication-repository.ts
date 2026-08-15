import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { nowLocalTimestamp } from '@/domain/datetime';
import type { Medication } from '@/domain/types';

interface MedicationRow {
  id: string;
  profile_id: string;
  name: string;
  dosage: string | null;
  quantity_per_dose: string | null;
  notes: string | null;
  times: string;
  start_date: string;
  active: number;
  created_at: string;
  updated_at: string;
}

function toMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    dosage: row.dosage,
    quantityPerDose: row.quantity_per_dose,
    notes: row.notes,
    times: JSON.parse(row.times) as string[],
    startDate: row.start_date,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface MedicationRoutineInput {
  profileId: string;
  name: string;
  dosage?: string | null;
  quantityPerDose?: string | null;
  notes?: string | null;
  /** Fixed daily times as "HH:mm", at least one required. */
  times: string[];
  startDate: string;
}

export class MedicationRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async listByProfile(profileId: string, options: { includeInactive?: boolean } = {}): Promise<Medication[]> {
    const rows = options.includeInactive
      ? await this.db.getAllAsync<MedicationRow>(
          'SELECT * FROM medications WHERE profile_id = ? ORDER BY created_at ASC;',
          profileId
        )
      : await this.db.getAllAsync<MedicationRow>(
          'SELECT * FROM medications WHERE profile_id = ? AND active = 1 ORDER BY created_at ASC;',
          profileId
        );
    return rows.map(toMedication);
  }

  async listActiveForAllProfiles(): Promise<Medication[]> {
    const rows = await this.db.getAllAsync<MedicationRow>(
      'SELECT * FROM medications WHERE active = 1 ORDER BY created_at ASC;'
    );
    return rows.map(toMedication);
  }

  async getById(id: string): Promise<Medication | null> {
    const row = await this.db.getFirstAsync<MedicationRow>(
      'SELECT * FROM medications WHERE id = ?;',
      id
    );
    return row ? toMedication(row) : null;
  }

  async create(input: MedicationRoutineInput): Promise<Medication> {
    const id = Crypto.randomUUID();
    const timestamp = nowLocalTimestamp();
    const times = [...input.times].sort();

    await this.db.runAsync(
      `INSERT INTO medications
        (id, profile_id, name, dosage, quantity_per_dose, notes, times, start_date, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`,
      id,
      input.profileId,
      input.name,
      input.dosage ?? null,
      input.quantityPerDose ?? null,
      input.notes ?? null,
      JSON.stringify(times),
      input.startDate,
      timestamp,
      timestamp
    );

    return {
      id,
      profileId: input.profileId,
      name: input.name,
      dosage: input.dosage ?? null,
      quantityPerDose: input.quantityPerDose ?? null,
      notes: input.notes ?? null,
      times,
      startDate: input.startDate,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  /**
   * Updates the routine configuration going forward. Never touches
   * dose_events, so history recorded under the previous configuration
   * stays exactly as it was.
   */
  async update(id: string, input: MedicationRoutineInput): Promise<void> {
    const times = [...input.times].sort();
    await this.db.runAsync(
      `UPDATE medications
       SET name = ?, dosage = ?, quantity_per_dose = ?, notes = ?, times = ?, start_date = ?, updated_at = ?
       WHERE id = ?;`,
      input.name,
      input.dosage ?? null,
      input.quantityPerDose ?? null,
      input.notes ?? null,
      JSON.stringify(times),
      input.startDate,
      nowLocalTimestamp(),
      id
    );
  }

  /** Deactivating/reactivating never deletes the row nor its dose_events. */
  async setActive(id: string, active: boolean): Promise<void> {
    await this.db.runAsync(
      'UPDATE medications SET active = ?, updated_at = ? WHERE id = ?;',
      active ? 1 : 0,
      nowLocalTimestamp(),
      id
    );
  }
}
