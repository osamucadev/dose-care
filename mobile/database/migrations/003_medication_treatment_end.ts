import type { Migration } from './types';

/**
 * Adds treatment-end fields to `medications`: migrations 001 and 002
 * have already run on a real device, so both stay exactly as they are
 * — this only adds to the schema.
 *
 * `end_mode DEFAULT 'ongoing'` means every medication already in the
 * database becomes a continuous (no end) treatment the moment this
 * runs — nothing existing stops generating occurrences.
 *
 * Each CHECK below only references the column it is attached to.
 * SQLite's `ALTER TABLE ADD COLUMN` does not support a CHECK spanning
 * multiple columns (see https://sqlite.org/lang_altertable.html), so
 * the real three-way combination — `ongoing` has neither end_date nor
 * total_scheduled_doses; `end_date` requires end_date and forbids
 * total_scheduled_doses; `dose_count` requires total_scheduled_doses
 * and forbids end_date — is enforced entirely in the domain layer
 * (`domain/validation.ts#assertValidTreatmentEndMode`), not in SQL.
 * Reconstructing the table just to express that combined constraint
 * would be disproportionate for what a second line of defense needs
 * to catch.
 */
export const medicationTreatmentEndFields: Migration = {
  version: 3,
  name: 'add_medication_treatment_end_fields',
  up: `
    ALTER TABLE medications ADD COLUMN end_mode TEXT NOT NULL DEFAULT 'ongoing'
      CHECK (end_mode IN ('ongoing', 'end_date', 'dose_count'));
    ALTER TABLE medications ADD COLUMN end_date TEXT
      CHECK (end_date IS NULL OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]');
    ALTER TABLE medications ADD COLUMN total_scheduled_doses INTEGER
      CHECK (total_scheduled_doses IS NULL OR total_scheduled_doses > 0);
  `,
};
