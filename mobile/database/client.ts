import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrate';

const DATABASE_NAME = 'dosecare.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Lazily opens (once per process) the app's single SQLite database and
 * brings it up to date via `runMigrations`. All repositories share this
 * connection instead of opening their own.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Connection-level pragmas. Both are no-ops (or outright disallowed)
  // inside a transaction, so they must run here — before any migration
  // opens its own transaction — rather than inside runMigrations.
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await runMigrations(db);
  return db;
}
