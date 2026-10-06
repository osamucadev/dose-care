import type { Migration } from './types';

/**
 * Lets a routine dose be taken earlier on the same day, per medication.
 * Off for every existing medication: whether a dose may be anticipated is
 * the user's decision (following whoever guides the treatment), never the
 * app's, so nothing changes until someone turns it on.
 */
export const medicationAllowEarly: Migration = {
  version: 7,
  name: 'add_medication_allow_early',
  up: `
    ALTER TABLE medications ADD COLUMN allow_early INTEGER NOT NULL DEFAULT 0 CHECK (allow_early IN (0, 1));
  `,
};
