import type { Migration } from './types';

/**
 * Tomado/Pular wait a few seconds before becoming a DoseEvent, so they
 * can be undone. The waiting action is stored here the moment the button
 * is tapped, so it survives the app being closed or killed inside that
 * window: on the next launch, whatever is left here is committed (the
 * user never undid it).
 *
 * This is not history. A row only says "a DoseEvent is about to be
 * written"; undoing deletes it, committing moves it to dose_events. At
 * most one row exists at a time in practice, keyed by occurrence id.
 */
export const pendingDoseActions: Migration = {
  version: 6,
  name: 'add_pending_dose_actions',
  up: `
    CREATE TABLE IF NOT EXISTS pending_dose_actions (
      occurrence_id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `,
};
