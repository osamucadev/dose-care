import { initialSchema } from './001_initial';
import { profileActiveColumn } from './002_profile_active';
import type { Migration } from './types';

/**
 * Ordered list of every schema migration ever shipped.
 *
 * To add a migration:
 *  1. Create `NNN_description.ts` (zero-padded, one higher than the
 *     current last version) exporting a `Migration` object.
 *  2. Import it here and append it to the array below — never insert it
 *     out of order or reuse a version number.
 *  3. Never edit a migration that has already shipped to a device; add
 *     a new one instead. `runMigrations` (see ../migrate.ts) applies
 *     each migration's SQL and its `user_version` bump inside a single
 *     atomic transaction, so a failing migration never leaves the
 *     schema half-applied — but that guarantee only holds if past
 *     migrations stay exactly as they were when they ran.
 */
export const migrations: Migration[] = [initialSchema, profileActiveColumn];

export type { Migration };
