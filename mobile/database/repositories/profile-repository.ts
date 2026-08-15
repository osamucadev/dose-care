import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { nowLocalTimestamp } from '@/domain/datetime';
import type { Profile, ProfileType } from '@/domain/types';

interface ProfileRow {
  id: string;
  name: string;
  type: string;
  avatar: string;
  color: string;
  notes: string | null;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    type: row.type as ProfileType,
    avatar: row.avatar,
    color: row.color,
    notes: row.notes,
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

  async listAll(): Promise<Profile[]> {
    const rows = await this.db.getAllAsync<ProfileRow>(
      'SELECT * FROM profiles ORDER BY created_at ASC;'
    );
    return rows.map(toProfile);
  }

  async getById(id: string): Promise<Profile | null> {
    const row = await this.db.getFirstAsync<ProfileRow>(
      'SELECT * FROM profiles WHERE id = ?;',
      id
    );
    return row ? toProfile(row) : null;
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const id = Crypto.randomUUID();
    const createdAt = nowLocalTimestamp();

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
      createdAt,
    };
  }

  async update(id: string, input: UpdateProfileInput): Promise<void> {
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
}
