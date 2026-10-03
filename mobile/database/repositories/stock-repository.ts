import type { SQLiteDatabase } from 'expo-sqlite';

import type { StockCount } from '@/domain/types';
import { assertValidStockCount } from '@/domain/validation';

interface StockCountRow {
  id: string;
  medication_id: string;
  doses_on_hand: number;
  counted_at: string;
  created_at: string;
}

function toStockCount(row: StockCountRow): StockCount {
  const count: StockCount = {
    id: row.id,
    medicationId: row.medication_id,
    dosesOnHand: row.doses_on_hand,
    countedAt: row.counted_at,
    createdAt: row.created_at,
  };
  assertValidStockCount(count);
  return count;
}

export class StockRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /** The latest count of each given medication; medications never counted are absent. */
  async latestByMedication(medicationIds: string[]): Promise<Record<string, StockCount>> {
    if (medicationIds.length === 0) return {};
    const placeholders = medicationIds.map(() => '?').join(', ');
    const rows = await this.db.getAllAsync<StockCountRow>(
      `SELECT * FROM stock_counts WHERE medication_id IN (${placeholders})
       ORDER BY counted_at DESC, created_at DESC;`,
      ...medicationIds
    );
    const latest: Record<string, StockCount> = {};
    for (const row of rows) {
      if (!latest[row.medication_id]) latest[row.medication_id] = toStockCount(row);
    }
    return latest;
  }

  /** Appends a count. Counts are never updated or deleted. */
  async create(count: StockCount): Promise<void> {
    assertValidStockCount(count);
    await this.db.runAsync(
      `INSERT INTO stock_counts (id, medication_id, doses_on_hand, counted_at, created_at)
       VALUES (?, ?, ?, ?, ?);`,
      count.id,
      count.medicationId,
      count.dosesOnHand,
      count.countedAt,
      count.createdAt
    );
  }
}
