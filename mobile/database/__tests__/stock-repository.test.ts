import { InvalidPersistedDataError } from '@/domain/validation';
import { asExpoDatabase, createTestDatabase, type NodeDatabase } from '@/test/node-sqlite';

import { DoseEventRepository } from '../repositories/dose-event-repository';
import { StockRepository } from '../repositories/stock-repository';

function seed(db: NodeDatabase) {
  db.exec(`
    INSERT INTO profiles (id, name, type, avatar, color, created_at)
      VALUES ('p1', 'Florita', 'elderly', 'svg:elderly', '#8F6FBF', '2026-10-01T00:00:00.000Z');
    INSERT INTO medications (id, profile_id, name, times, start_date, created_at, updated_at)
      VALUES ('m1', 'p1', 'Losartana', '["08:00"]', '2026-10-01', '2026-10-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'),
             ('m2', 'p1', 'Vitamina', '["12:00"]', '2026-10-01', '2026-10-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z');
  `);
}

function insertEvent(db: NodeDatabase, id: string, scheduledAt: string, occurredAt: string, status = 'taken') {
  db.prepare(
    `INSERT INTO dose_events (id, profile_id, medication_id, medication_name_snapshot, scheduled_at, occurred_at, status, created_at)
     VALUES (?, 'p1', 'm1', 'Losartana', ?, ?, ?, ?)`
  ).run(id, scheduledAt, occurredAt, status, occurredAt);
}

const count = (id: string, dosesOnHand: number, countedAt: string) => ({
  id,
  medicationId: 'm1',
  dosesOnHand,
  countedAt,
  createdAt: countedAt,
});

describe('StockRepository', () => {
  it('returns the latest count per medication', async () => {
    const db = createTestDatabase();
    seed(db);
    const repo = new StockRepository(asExpoDatabase(db));

    await repo.create(count('c1', 30, '2026-10-01T10:00:00.000Z'));
    await repo.create(count('c2', 60, '2026-10-02T10:00:00.000Z'));

    const latest = await repo.latestByMedication(['m1', 'm2']);
    expect(latest.m1.id).toBe('c2');
    expect(latest.m2).toBeUndefined();
  });

  it('rejects an invalid count before any SQL runs', async () => {
    const db = createTestDatabase();
    seed(db);
    const repo = new StockRepository(asExpoDatabase(db));
    await expect(repo.create(count('c1', -1, '2026-10-01T10:00:00.000Z'))).rejects.toThrow(InvalidPersistedDataError);
  });

  it('is rejected by the database for a negative amount too', () => {
    const db = createTestDatabase();
    seed(db);
    expect(() =>
      db.exec(
        "INSERT INTO stock_counts VALUES ('c1', 'm1', -3, '2026-10-01T10:00:00.000Z', '2026-10-01T10:00:00.000Z')"
      )
    ).toThrow(/CHECK/);
  });
});

describe('DoseEventRepository.countTakenSince', () => {
  it('counts only doses taken after the given instant, by when they were taken', async () => {
    const db = createTestDatabase();
    seed(db);
    insertEvent(db, 'e1', '2026-10-01T08:00', '2026-10-01T11:00:00.000Z');
    // Scheduled before the count but recorded after it: consumed after the count.
    insertEvent(db, 'e2', '2026-10-01T09:00', '2026-10-01T13:00:00.000Z');
    insertEvent(db, 'e3', '2026-10-02T08:00', '2026-10-02T11:00:00.000Z');
    insertEvent(db, 'e4', '2026-10-03T08:00', '2026-10-03T11:00:00.000Z', 'skipped');

    const repo = new DoseEventRepository(asExpoDatabase(db));
    expect(await repo.countTakenSince('m1', '2026-10-01T12:00:00.000Z')).toBe(2);
    expect(await repo.countTakenSince('m2', '2026-10-01T12:00:00.000Z')).toBe(0);
  });
});
