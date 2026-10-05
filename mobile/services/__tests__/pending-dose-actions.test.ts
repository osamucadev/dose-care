import { DoseEventRepository } from '@/database/repositories/dose-event-repository';
import { PendingDoseActionRepository } from '@/database/repositories/pending-dose-action-repository';
import { InvalidPersistedDataError, parseStoredPendingDoseAction, type StoredPendingDoseAction } from '@/domain/validation';
import { asExpoDatabase, createTestDatabase, type NodeDatabase } from '@/test/node-sqlite';

import { commitLeftovers, commitStoredAction } from '../pending-dose-actions';

function seed(db: NodeDatabase) {
  db.exec(`
    INSERT INTO profiles (id, name, type, avatar, color, created_at)
      VALUES ('p1', 'Florita', 'elderly', 'svg:elderly', '#8F6FBF', '2026-10-01T00:00:00.000Z');
    INSERT INTO medications (id, profile_id, name, times, start_date, created_at, updated_at)
      VALUES ('m1', 'p1', 'Losartana', '["08:00","20:00"]', '2026-10-01', '2026-10-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z');
  `);
}

function action(scheduledAt: string, overrides: Partial<StoredPendingDoseAction> = {}): StoredPendingDoseAction {
  return {
    occurrence: {
      id: `m1_${scheduledAt}`,
      profileId: 'p1',
      medicationId: 'm1',
      medicationName: 'Losartana',
      dosage: '50 mg',
      quantityPerDose: '1 comprimido',
      scheduledAt,
    },
    status: 'skipped',
    occurredAt: '2026-10-04T11:03:00.000Z',
    ...overrides,
  };
}

function setup() {
  const db = createTestDatabase();
  seed(db);
  const expo = asExpoDatabase(db);
  const stores = { pendingDoseActions: new PendingDoseActionRepository(expo), doseEvents: new DoseEventRepository(expo) };
  let n = 0;
  const newId = () => `event-${++n}`;
  const events = () =>
    db.prepare('SELECT scheduled_at, status, occurred_at FROM dose_events ORDER BY scheduled_at').all() as {
      scheduled_at: string;
      status: string;
      occurred_at: string;
    }[];
  return { db, stores, newId, events };
}

describe('commitStoredAction', () => {
  it('writes the DoseEvent with the moment of the tap and clears the pending row', async () => {
    const { stores, newId, events } = setup();
    const waiting = action('2026-10-04T08:00');
    await stores.pendingDoseActions.save(waiting);

    expect(await commitStoredAction(stores, waiting, newId)).toBe('written');

    expect(events()).toEqual([
      { scheduled_at: '2026-10-04T08:00', status: 'skipped', occurred_at: '2026-10-04T11:03:00.000Z' },
    ]);
    expect(await stores.pendingDoseActions.listAll()).toEqual([]);
  });

  it('is safe to repeat after dying between the two writes', async () => {
    const { stores, newId, events } = setup();
    const waiting = action('2026-10-04T08:00');
    await stores.pendingDoseActions.save(waiting);
    await commitStoredAction(stores, waiting, newId);
    // Simulate the pending row surviving a crash right after the event write.
    await stores.pendingDoseActions.save(waiting);

    expect(await commitStoredAction(stores, waiting, newId)).toBe('already-resolved');
    expect(events()).toHaveLength(1);
    expect(await stores.pendingDoseActions.listAll()).toEqual([]);
  });
});

describe('commitLeftovers (app was closed inside the undo window)', () => {
  it('commits every action still waiting, oldest first', async () => {
    const { stores, newId, events } = setup();
    await stores.pendingDoseActions.save(action('2026-10-04T08:00', { status: 'taken' }));
    await stores.pendingDoseActions.save(action('2026-10-04T20:00'));

    expect(await commitLeftovers(stores, newId)).toBe(2);
    expect(events().map((e) => e.status)).toEqual(['taken', 'skipped']);
    expect(await stores.pendingDoseActions.listAll()).toEqual([]);
  });

  it('commits nothing that was undone', async () => {
    const { stores, newId, events } = setup();
    await stores.pendingDoseActions.save(action('2026-10-04T08:00'));
    await stores.pendingDoseActions.remove('m1_2026-10-04T08:00');

    expect(await commitLeftovers(stores, newId)).toBe(0);
    expect(events()).toEqual([]);
  });

  it('drops a corrupted row instead of blocking every later launch', async () => {
    const { db, stores, newId, events } = setup();
    db.exec("INSERT INTO pending_dose_actions VALUES ('broken', '{not json', '2026-10-04T11:00:00.000Z')");

    expect(await commitLeftovers(stores, newId)).toBe(0);
    expect(events()).toEqual([]);
    expect(await stores.pendingDoseActions.listAll()).toEqual([]);
  });
});

describe('parseStoredPendingDoseAction', () => {
  it('round-trips a saved action', () => {
    const waiting = action('2026-10-04T08:00');
    expect(parseStoredPendingDoseAction(JSON.stringify(waiting))).toEqual(waiting);
  });

  it.each([
    ['an unknown status', { ...action('2026-10-04T08:00'), status: 'snoozed' }],
    ['an impossible scheduled time', action('2026-02-30T08:00')],
    ['a tap time that is not UTC', { ...action('2026-10-04T08:00'), occurredAt: '2026-10-04 08:00' }],
  ])('rejects %s', (_label, payload) => {
    expect(() => parseStoredPendingDoseAction(JSON.stringify(payload))).toThrow(InvalidPersistedDataError);
  });
});
