import type { DoseOccurrence } from '@/domain/types';
import { DoseAlreadyResolvedError } from '@/services/dose-service';

import { DoseActionLock } from '../dose-action-lock';
import { runDoseAction, withAlwaysRefresh } from '../dose-action-runner';

function makeOccurrence(overrides: Partial<DoseOccurrence> = {}): DoseOccurrence {
  return {
    id: 'occ-1',
    profileId: 'profile-1',
    medicationId: 'med-1',
    medicationName: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: '1 comprimido',
    scheduledAt: '2026-08-15T08:00',
    status: 'pending',
    event: null,
    ...overrides,
  };
}

/** A promise plus its resolve/reject, so a test can control exactly when a call "finishes". */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('runDoseAction', () => {
  it('runs recordDose exactly once when two calls for the same occurrence overlap', async () => {
    const occurrence = makeOccurrence();
    const lock = new DoseActionLock();
    const gate = deferred<void>();
    const recordDose = jest.fn().mockReturnValue(gate.promise);

    // Fire two calls back to back, before the first has any chance to
    // finish (recordDose is still pending on `gate`).
    const first = runDoseAction(lock, recordDose, occurrence, 'taken');
    const second = runDoseAction(lock, recordDose, occurrence, 'taken');

    expect(recordDose).toHaveBeenCalledTimes(1);

    gate.resolve();
    const [firstOutcome, secondOutcome] = await Promise.all([first, second]);

    expect(recordDose).toHaveBeenCalledTimes(1);
    expect(firstOutcome).toEqual({ started: true });
    expect(secondOutcome).toEqual({ started: false });
  });

  it('releases the lock after success, allowing a later call to proceed', async () => {
    const occurrence = makeOccurrence();
    const lock = new DoseActionLock();
    const recordDose = jest.fn().mockResolvedValue(undefined);

    await runDoseAction(lock, recordDose, occurrence, 'taken');
    expect(lock.isLocked(occurrence.id)).toBe(false);

    const outcome = await runDoseAction(lock, recordDose, occurrence, 'skipped');

    expect(outcome).toEqual({ started: true });
    expect(recordDose).toHaveBeenCalledTimes(2);
  });

  it('releases the lock after a failure, allowing a retry', async () => {
    const occurrence = makeOccurrence();
    const lock = new DoseActionLock();
    const recordDose = jest.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined);

    const failed = await runDoseAction(lock, recordDose, occurrence, 'taken');
    expect(failed.started).toBe(true);
    expect(failed.error).toBeInstanceOf(Error);
    expect(lock.isLocked(occurrence.id)).toBe(false);

    const retried = await runDoseAction(lock, recordDose, occurrence, 'taken');
    expect(retried).toEqual({ started: true });
    expect(recordDose).toHaveBeenCalledTimes(2);
  });

  it('processes a different occurrence independently while one is in flight', async () => {
    const occurrenceA = makeOccurrence({ id: 'occ-a' });
    const occurrenceB = makeOccurrence({ id: 'occ-b' });
    const lock = new DoseActionLock();
    const gate = deferred<void>();
    const recordDose = jest.fn().mockImplementation((occurrence: DoseOccurrence) => {
      return occurrence.id === occurrenceA.id ? gate.promise : Promise.resolve();
    });

    const pendingA = runDoseAction(lock, recordDose, occurrenceA, 'taken');
    const outcomeB = await runDoseAction(lock, recordDose, occurrenceB, 'taken');

    expect(outcomeB).toEqual({ started: true });
    expect(lock.isLocked(occurrenceB.id)).toBe(false);
    expect(lock.isLocked(occurrenceA.id)).toBe(true);

    gate.resolve();
    await pendingA;
  });

  it('carries a DoseAlreadyResolvedError through distinguishably from a generic error', async () => {
    const lock = new DoseActionLock();
    const alreadyResolved = jest.fn().mockRejectedValue(new DoseAlreadyResolvedError());
    const generic = jest.fn().mockRejectedValue(new Error('database is locked'));

    const outcomeA = await runDoseAction(lock, alreadyResolved, makeOccurrence({ id: 'occ-a' }), 'taken');
    const outcomeB = await runDoseAction(lock, generic, makeOccurrence({ id: 'occ-b' }), 'taken');

    expect(outcomeA.error).toBeInstanceOf(DoseAlreadyResolvedError);
    expect(outcomeB.error).not.toBeInstanceOf(DoseAlreadyResolvedError);
  });
});

describe('withAlwaysRefresh', () => {
  it('refreshes after a successful action', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const action = jest.fn().mockResolvedValue('ok');

    const result = await withAlwaysRefresh(action, refresh);

    expect(result).toBe('ok');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('still refreshes, and re-throws, when the action fails with DoseAlreadyResolvedError', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const action = jest.fn().mockRejectedValue(new DoseAlreadyResolvedError());

    await expect(withAlwaysRefresh(action, refresh)).rejects.toBeInstanceOf(DoseAlreadyResolvedError);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('still refreshes, and re-throws, for any other (non-duplicate) error', async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    const action = jest.fn().mockRejectedValue(new Error('database is locked'));

    await expect(withAlwaysRefresh(action, refresh)).rejects.toThrow('database is locked');
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
