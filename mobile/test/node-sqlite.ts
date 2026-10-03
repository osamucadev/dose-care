import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from '@/database/migrations';

// Node's built-in SQLite driver, used to run the real migrations and
// repository SQL under Jest, where expo-sqlite has no native runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');

export type NodeDatabase = InstanceType<typeof DatabaseSync>;

type Param = string | number | null;

/** An in-memory database with every migration up to `version` applied. */
export function createTestDatabase(version = Infinity): NodeDatabase {
  const db = new DatabaseSync(':memory:');
  for (const migration of migrations.filter((m) => m.version <= version)) db.exec(migration.up);
  return db;
}

/**
 * The slice of expo-sqlite's async API the repositories use, backed by
 * a node:sqlite database, so repositories can be tested against real SQL.
 */
export function asExpoDatabase(db: NodeDatabase): SQLiteDatabase {
  const adapter = {
    getAllAsync: async (sql: string, ...params: Param[]) => db.prepare(sql).all(...params),
    getFirstAsync: async (sql: string, ...params: Param[]) => db.prepare(sql).get(...params) ?? null,
    runAsync: async (sql: string, ...params: Param[]) => db.prepare(sql).run(...params),
    execAsync: async (sql: string) => db.exec(sql),
  };
  return adapter as unknown as SQLiteDatabase;
}
