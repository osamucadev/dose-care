import type { Migration } from './types';

/**
 * Initial schema. Config (profiles, medications) is separated from
 * occurrence data (dose_events) per the app's core architectural rule:
 * dose_events is the only source of truth for history and is never
 * rewritten by later edits to a medication.
 */
export const initialSchema: Migration = {
  version: 1,
  name: 'initial_schema',
  up: `
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      avatar TEXT NOT NULL,
      color TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      name TEXT NOT NULL,
      dosage TEXT,
      quantity_per_dose TEXT,
      notes TEXT,
      times TEXT NOT NULL,
      start_date TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_medications_profile_id ON medications(profile_id);

    CREATE TABLE IF NOT EXISTS dose_events (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      medication_id TEXT NOT NULL REFERENCES medications(id),
      medication_name_snapshot TEXT NOT NULL,
      dosage_snapshot TEXT,
      quantity_snapshot TEXT,
      scheduled_at TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(medication_id, scheduled_at)
    );

    CREATE INDEX IF NOT EXISTS idx_dose_events_profile_id ON dose_events(profile_id);
    CREATE INDEX IF NOT EXISTS idx_dose_events_medication_id ON dose_events(medication_id);
  `,
};
