import type { Profile } from './types';

/**
 * Keeps a "selected profile" filter (e.g. Home's horizontal selector)
 * in sync with the current list of active profiles: if the selection
 * still exists there, it is preserved unchanged; otherwise — most
 * commonly because the selected profile was just soft-deleted, but
 * also true while there is simply no selection — it falls back to
 * `null`, the "Todos" view.
 *
 * Callers must only run this once profile loading has settled
 * successfully; calling it against a transient empty list (still
 * loading, or a failed fetch) would incorrectly clear a valid
 * selection just because the list momentarily looks empty.
 */
export function reconcileSelectedProfileId(
  selectedProfileId: string | null,
  profiles: Profile[]
): string | null {
  if (selectedProfileId === null) return null;
  return profiles.some((profile) => profile.id === selectedProfileId) ? selectedProfileId : null;
}
