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
  await runMigrations(db);
  return db;
}
