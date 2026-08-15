import type { SQLiteDatabase } from 'expo-sqlite';

import { MedicationRepository } from '../repositories/medication-repository';

function fakeDb() {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue(undefined),
  } as unknown as SQLiteDatabase & { getAllAsync: jest.Mock };
}

describe('MedicationRepository.listActiveForAllProfiles', () => {
  it('guards against an inactive profile via an EXISTS subquery, not just medications.active', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.listActiveForAllProfiles();

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).toMatch(/m\.active\s*=\s*1/);
    expect(sql).toMatch(/EXISTS\s*\(/i);
    expect(sql).toMatch(/FROM\s+profiles\s+p/i);
    expect(sql).toMatch(/p\.active\s*=\s*1/);
    expect(sql).toMatch(/p\.id\s*=\s*m\.profile_id/i);
  });
});

describe('MedicationRepository.listByProfile', () => {
  it('filters to active medications by default', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.listByProfile('profile-1');

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).toMatch(/active\s*=\s*1/);
  });

  it('includes inactive medications when explicitly requested', async () => {
    const db = fakeDb();
    const repo = new MedicationRepository(db);

    await repo.listByProfile('profile-1', { includeInactive: true });

    const [sql] = db.getAllAsync.mock.calls[0];
    expect(sql).not.toMatch(/active\s*=\s*1/);
  });
});
