import type { SQLiteDatabase } from 'expo-sqlite';

import type { DoseEvent } from '@/domain/types';
import { InvalidPersistedDataError } from '@/domain/validation';

import { DoseAlreadyResolvedError, DoseEventRepository } from '../repositories/dose-event-repository';

const event: DoseEvent = {
  id: 'event-1',
  profileId: 'profile-1',
  medicationId: 'med-1',
  medicationNameSnapshot: 'Losartana',
  dosageSnapshot: '50 mg',
  quantitySnapshot: '1 comprimido',
  scheduledAt: '2026-08-15T08:00',
  occurredAt: '2026-08-15T11:03:12.000Z',
  status: 'taken',
  createdAt: '2026-08-15T11:03:12.000Z',
};

/**
 * A minimal fake standing in for the one method `create()` calls.
 * Repositories are typed against the real `SQLiteDatabase` (no DI
 * abstraction was worth adding just for this), so the test double is
 * cast through `unknown` — a deliberate, narrowly-scoped choice for a
 * test file, not a production shortcut.
 */
function fakeDbThatThrows(message: string): SQLiteDatabase {
  return {
    runAsync: jest.fn().mockRejectedValue(new Error(message)),
  } as unknown as SQLiteDatabase;
}

describe('DoseEventRepository.create', () => {
  it('maps a UNIQUE constraint violation to a friendly DoseAlreadyResolvedError', async () => {
    const repo = new DoseEventRepository(
      fakeDbThatThrows('UNIQUE constraint failed: dose_events.medication_id, dose_events.scheduled_at')
    );

    await expect(repo.create(event)).rejects.toBeInstanceOf(DoseAlreadyResolvedError);
    await expect(repo.create(event)).rejects.toThrow(/já foi registrada/);
  });

  it('re-throws any other database error unchanged', async () => {
    const repo = new DoseEventRepository(fakeDbThatThrows('database is locked'));

    await expect(repo.create(event)).rejects.toThrow('database is locked');
    await expect(repo.create(event)).rejects.not.toBeInstanceOf(DoseAlreadyResolvedError);
  });

  it('validates the event before running any SQL, never reaching runAsync for an invalid one', async () => {
    const runAsync = jest.fn();
    const db = { runAsync } as unknown as SQLiteDatabase;
    const repo = new DoseEventRepository(db);

    await expect(repo.create({ ...event, status: 'pending' as DoseEvent['status'] })).rejects.toBeInstanceOf(
      InvalidPersistedDataError
    );
    expect(runAsync).not.toHaveBeenCalled();
  });
});
