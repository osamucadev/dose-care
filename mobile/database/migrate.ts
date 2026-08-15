import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from './migrations';

/**
 * Applies every pending migration in order, tracking progress with
 * SQLite's built-in `user_version` pragma. Never drops or recreates
 * the database — each migration only adds to what is already there.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let currentVersion = row?.user_version ?? 0;

  const pending = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.execAsync(migration.up);
    await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    currentVersion = migration.version;
  }
}
