/**
 * `useLocalSearchParams` can hand back a route param as a plain
 * string, an array of strings (repeated/catch-all segments), or
 * `undefined` — this resolves that down to a single non-empty id, or
 * `null` when there isn't a usable one to navigate with. Kept
 * framework-free (plain `string | string[] | undefined`, no
 * expo-router import) so it can be unit tested directly.
 */
export function normalizeProfileId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.trim().length > 0 ? raw : null;
}
