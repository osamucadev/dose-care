import type { Migration } from './types';

/**
 * Stock is not a mutable column on medications. Each time the user
 * records how many doses they have on hand (after buying more, or after
 * recounting), an immutable row is appended here. Current stock is then
 * derived: the latest count minus the doses taken after it (see
 * `domain/stock.ts`), so it can never drift from the dose history.
 */
export const stockCounts: Migration = {
  version: 5,
  name: 'add_stock_counts',
  up: `
    CREATE TABLE IF NOT EXISTS stock_counts (
      id TEXT PRIMARY KEY NOT NULL,
      medication_id TEXT NOT NULL REFERENCES medications(id),
      doses_on_hand INTEGER NOT NULL CHECK (doses_on_hand >= 0),
      counted_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_stock_counts_medication ON stock_counts(medication_id, counted_at);
    CREATE INDEX IF NOT EXISTS idx_dose_events_medication_taken ON dose_events(medication_id, status, occurred_at);
  `,
};
