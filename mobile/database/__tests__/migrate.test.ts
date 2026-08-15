import type { MigrationRunner } from '../migrate';

/**
 * In-memory stand-in for a SQLite connection, implementing only the
 * narrow `MigrationRunner` surface. `withExclusiveTransactionAsync`
 * mimics real transaction semantics: state changes made by `task` are
 * only kept if `task` resolves; if it throws, everything it did is
 * rolled back and the error propagates — no native SQLite involved.
 */
class FakeDb implements MigrationRunner {
  version = 0;
  applied: string[] = [];

  async execAsync(source: string): Promise<void> {
    const versionMatch = source.match(/PRAGMA user_version = (\d+)/);
    if (versionMatch) {
      this.version = Number(versionMatch[1]);
      return;
    }
    if (source === 'THIS WILL FAIL') {
      throw new Error('simulated migration failure');
    }
    this.applied.push(source);
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return { user_version: this.version } as unknown as T;
  }

  async withExclusiveTransactionAsync(task: (txn: MigrationRunner) => Promise<void>): Promise<void> {
    const snapshotVersion = this.version;
    const snapshotApplied = [...this.applied];
    try {
      await task(this);
    } catch (error) {
      this.version = snapshotVersion;
      this.applied = snapshotApplied;
      throw error;
    }
  }
}

function loadRunMigrations(mockMigrations: unknown) {
  jest.resetModules();
  jest.doMock('../migrations', () => ({ migrations: mockMigrations }));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('../migrate') as typeof import('../migrate')).runMigrations;
}

describe('runMigrations', () => {
  afterEach(() => {
    jest.dontMock('../migrations');
    jest.resetModules();
  });

  it('applies all pending migrations in order and advances user_version to the latest', async () => {
    const runMigrations = loadRunMigrations([
      { version: 1, name: 'first', up: 'CREATE TABLE a (id TEXT);' },
      { version: 2, name: 'second', up: 'CREATE TABLE b (id TEXT);' },
    ]);
    const db = new FakeDb();

    await runMigrations(db);

    expect(db.version).toBe(2);
    expect(db.applied).toEqual(['CREATE TABLE a (id TEXT);', 'CREATE TABLE b (id TEXT);']);
  });

  it('does not re-apply migrations already reflected in user_version (idempotent)', async () => {
    const runMigrations = loadRunMigrations([
      { version: 1, name: 'first', up: 'CREATE TABLE a (id TEXT);' },
    ]);
    const db = new FakeDb();
    db.version = 1;

    await runMigrations(db);

    expect(db.applied).toEqual([]);
    expect(db.version).toBe(1);
  });

  it('only applies migrations newer than the current version', async () => {
    const runMigrations = loadRunMigrations([
      { version: 1, name: 'first', up: 'CREATE TABLE a (id TEXT);' },
      { version: 2, name: 'second', up: 'CREATE TABLE b (id TEXT);' },
    ]);
    const db = new FakeDb();
    db.version = 1;

    await runMigrations(db);

    expect(db.applied).toEqual(['CREATE TABLE b (id TEXT);']);
    expect(db.version).toBe(2);
  });

  it('rolls back atomically and leaves user_version untouched when a migration fails', async () => {
    const runMigrations = loadRunMigrations([
      { version: 1, name: 'first', up: 'CREATE TABLE a (id TEXT);' },
      { version: 2, name: 'broken', up: 'THIS WILL FAIL' },
    ]);
    const db = new FakeDb();

    await expect(runMigrations(db)).rejects.toThrow('simulated migration failure');

    // The first migration committed...
    expect(db.version).toBe(1);
    expect(db.applied).toEqual(['CREATE TABLE a (id TEXT);']);
    // ...but the second's SQL never persisted, and user_version was
    // never advanced past the last successfully committed migration.
  });

  it('re-running after a failed migration retries only the migrations still pending', async () => {
    const failingMigrations = [
      { version: 1, name: 'first', up: 'CREATE TABLE a (id TEXT);' },
      { version: 2, name: 'broken', up: 'THIS WILL FAIL' },
    ];
    const runMigrationsFailing = loadRunMigrations(failingMigrations);
    const db = new FakeDb();
    await expect(runMigrationsFailing(db)).rejects.toThrow();
    expect(db.version).toBe(1);

    const runMigrationsFixed = loadRunMigrations([
      failingMigrations[0],
      { version: 2, name: 'fixed', up: 'CREATE TABLE b (id TEXT);' },
    ]);
    await runMigrationsFixed(db);

    expect(db.version).toBe(2);
    expect(db.applied).toEqual(['CREATE TABLE a (id TEXT);', 'CREATE TABLE b (id TEXT);']);
  });
});
