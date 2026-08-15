import type { SQLiteDatabase } from 'expo-sqlite';

import { InvalidPersistedDataError } from '@/domain/validation';

import { ProfileRepository } from '../repositories/profile-repository';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'profile-1',
    name: 'Florita',
    type: 'elderly',
    avatar: '👵',
    color: '#8B6FB3',
    notes: null,
    active: 1,
    created_at: '2026-08-15T00:00:00.000Z',
    ...overrides,
  };
}

/** Minimal fake exposing only what ProfileRepository calls. */
function fakeDb(overrides: Partial<{ getAllAsync: jest.Mock; getFirstAsync: jest.Mock; runAsync: jest.Mock }> = {}) {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as SQLiteDatabase & { getAllAsync: jest.Mock; getFirstAsync: jest.Mock; runAsync: jest.Mock };
}

describe('ProfileRepository.listAll', () => {
  it('queries only active profiles by default', async () => {
    const db = fakeDb();
    const repo = new ProfileRepository(db);

    await repo.listAll();

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).toMatch(/active\s*=\s*1/);
  });

  it('does not filter by active when includeInactive is requested', async () => {
    const db = fakeDb();
    const repo = new ProfileRepository(db);

    await repo.listAll({ includeInactive: true });

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).not.toMatch(/active\s*=\s*1/);
  });

  it('maps active 1/0 rows to booleans', async () => {
    const db = fakeDb({
      getAllAsync: jest
        .fn()
        .mockResolvedValue([makeRow({ id: 'p1', active: 1 }), makeRow({ id: 'p2', active: 0 })]),
    });
    const repo = new ProfileRepository(db);

    const result = await repo.listAll({ includeInactive: true });

    expect(result.map((p) => [p.id, p.active])).toEqual([
      ['p1', true],
      ['p2', false],
    ]);
  });

  it('rejects a corrupted active flag instead of silently coercing it', async () => {
    const db = fakeDb({ getAllAsync: jest.fn().mockResolvedValue([makeRow({ active: 7 })]) });
    const repo = new ProfileRepository(db);

    await expect(repo.listAll()).rejects.toBeInstanceOf(InvalidPersistedDataError);
  });
});

describe('ProfileRepository.getById', () => {
  it('is not filtered by active — it can still find an inactive (soft-deleted) profile', async () => {
    const db = fakeDb({ getFirstAsync: jest.fn().mockResolvedValue(makeRow({ active: 0 })) });
    const repo = new ProfileRepository(db);

    const result = await repo.getById('profile-1');

    expect(result?.active).toBe(false);
    const [sql] = db.getFirstAsync.mock.calls[0];
    expect(sql).not.toMatch(/active\s*=\s*1/);
  });
});

describe('ProfileRepository.setActive', () => {
  it('only updates the profiles table — history and medications are untouched', async () => {
    const db = fakeDb();
    const repo = new ProfileRepository(db);

    await repo.setActive('profile-1', false);

    expect(db.runAsync).toHaveBeenCalledTimes(1);
    const [sql, ...params] = db.runAsync.mock.calls[0];
    expect(sql).toMatch(/UPDATE\s+profiles\s+SET\s+active\s*=\s*\?/i);
    expect(sql).not.toMatch(/dose_events|medications|DELETE/i);
    expect(params).toEqual([0, 'profile-1']);
  });

  it('reactivating writes active = 1', async () => {
    const db = fakeDb();
    const repo = new ProfileRepository(db);

    await repo.setActive('profile-1', true);

    const [, ...params] = db.runAsync.mock.calls[0];
    expect(params).toEqual([1, 'profile-1']);
  });
});
