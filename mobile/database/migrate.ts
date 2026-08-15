import { migrations } from './migrations';

/**
 * The minimal surface `runMigrations` needs from a database connection.
 * Deliberately narrower than `expo-sqlite`'s `SQLiteDatabase` type so
 * the migration-selection/atomicity logic can be exercised in a unit
 * test with an in-memory fake, without a native SQLite runtime. A real
 * `SQLiteDatabase` satisfies this structurally, so callers pass it in
 * unchanged (see `database/client.ts`).
 */
export interface MigrationRunner {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string): Promise<T | null>;
  withExclusiveTransactionAsync(task: (txn: MigrationRunner) => Promise<void>): Promise<void>;
}

/**
 * Applies every pending migration in order, tracking progress with
 * SQLite's `user_version` pragma.
 *
 * Each migration's SQL plus its `user_version` bump run inside a single
 * `withExclusiveTransactionAsync` call — expo-sqlite's safe transaction
 * API, not a hand-rolled BEGIN/COMMIT — so a failing migration rolls
 * back atomically and `user_version` is left untouched: the database
 * never ends up in a partially-applied state. Never drops or recreates
 * the database; each migration only adds to what is already there.
 *
 * See `./migrations/index.ts` for how to add a new migration.
 */
export async function runMigrations(db: MigrationRunner): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let currentVersion = row?.user_version ?? 0;

  const pending = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migration.up);
      await txn.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
    currentVersion = migration.version;
  }
}
