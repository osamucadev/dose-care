import type { Migration } from './types';

/**
 * Adds Profile.active (soft-delete flag): the app and migration 001
 * have already run on a real device, so 001 stays exactly as it is —
 * this only adds to the schema, never edits what shipped.
 *
 * `DEFAULT 1` means every profile already in the database becomes
 * active the moment this runs, so nothing existing disappears. The
 * CHECK constraint is allowed on `ALTER TABLE ADD COLUMN` in SQLite as
 * long as it only references the new column itself (see
 * https://sqlite.org/lang_altertable.html), which is the case here.
 *
 * "Deleting" a profile only ever flips this flag — the row, its
 * medications, and its dose_events are never removed. No foreign key
 * in this schema cascades a delete, so history stays intact and the
 * app is ready for a future archived-profiles view without needing a
 * further migration for that.
 */
export const profileActiveColumn: Migration = {
  version: 2,
  name: 'add_profile_active',
  up: `
    ALTER TABLE profiles ADD COLUMN active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1));
  `,
};
