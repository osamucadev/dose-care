import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { nowUtcIso } from '@/domain/datetime';
import type { Profile, ProfileType } from '@/domain/types';
import { InvalidPersistedDataError, assertValidProfileInput, isValidProfileType } from '@/domain/validation';

interface ProfileRow {
  id: string;
  name: string;
  type: string;
  avatar: string;
  color: string;
  notes: string | null;
  active: number;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  if (!isValidProfileType(row.type)) {
    throw new InvalidPersistedDataError(`Profile ${row.id} has an unknown type: ${row.type}.`);
  }
  if (row.active !== 0 && row.active !== 1) {
    throw new InvalidPersistedDataError(`Profile ${row.id} has an invalid active flag: ${row.active}.`);
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    avatar: row.avatar,
    color: row.color,
    notes: row.notes,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

export interface CreateProfileInput {
  name: string;
  type: ProfileType;
  avatar: string;
  color: string;
  notes?: string | null;
}

export interface UpdateProfileInput {
  name: string;
  type: ProfileType;
  avatar: string;
  color: string;
  notes?: string | null;
}

export class ProfileRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /**
   * Active profiles by default — this is what the Home screen, the
   * profile selector and the aggregated cards use. Pass
   * `includeInactive` for a future archived-profiles view; nothing in
   * this MVP calls it yet.
   */
  async listAll(options: { includeInactive?: boolean } = {}): Promise<Profile[]> {
    const rows = options.includeInactive
      ? await this.db.getAllAsync<ProfileRow>('SELECT * FROM profiles ORDER BY created_at ASC;')
      : await this.db.getAllAsync<ProfileRow>(
          'SELECT * FROM profiles WHERE active = 1 ORDER BY created_at ASC;'
        );
    return rows.map(toProfile);
  }

  /** Unfiltered by active — used to look a specific profile up by id regardless of its state. */
  async getById(id: string): Promise<Profile | null> {
    const row = await this.db.getFirstAsync<ProfileRow>(
      'SELECT * FROM profiles WHERE id = ?;',
      id
    );
    return row ? toProfile(row) : null;
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    assertValidProfileInput(input);
    const id = Crypto.randomUUID();
    const createdAt = nowUtcIso();

    await this.db.runAsync(
      `INSERT INTO profiles (id, name, type, avatar, color, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      id,
      input.name,
      input.type,
      input.avatar,
      input.color,
      input.notes ?? null,
      createdAt
    );

    return {
      id,
      name: input.name,
      type: input.type,
      avatar: input.avatar,
      color: input.color,
      notes: input.notes ?? null,
      active: true,
      createdAt,
    };
  }

  async update(id: string, input: UpdateProfileInput): Promise<void> {
    assertValidProfileInput(input);
    await this.db.runAsync(
      `UPDATE profiles SET name = ?, type = ?, avatar = ?, color = ?, notes = ? WHERE id = ?;`,
      input.name,
      input.type,
      input.avatar,
      input.color,
      input.notes ?? null,
      id
    );
  }

  /**
   * Soft-delete/restore. Only ever touches `profiles.active` — the
   * profile row, its medications and its dose_events are untouched, so
   * history stays intact.
   */
  async setActive(id: string, active: boolean): Promise<void> {
    await this.db.runAsync('UPDATE profiles SET active = ? WHERE id = ?;', active ? 1 : 0, id);
  }
}
