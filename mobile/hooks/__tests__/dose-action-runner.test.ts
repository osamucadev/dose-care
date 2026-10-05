import { DoseActionLock } from '../dose-action-lock';
import { runLockedAction, runThenRefreshOnSuccess } from '../dose-action-runner';

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

describe('runLockedAction', () => {
  it('reuses the same lock for keys unrelated to dose occurrences, e.g. medication ids', async () => {
    const lock = new DoseActionLock();
    const gate = deferred<void>();
    const setActive = jest.fn().mockReturnValue(gate.promise);

    const first = runLockedAction(lock, 'medication-1', setActive);
    const second = runLockedAction(lock, 'medication-1', setActive);

    expect(setActive).toHaveBeenCalledTimes(1);

    gate.resolve();
    const [firstOutcome, secondOutcome] = await Promise.all([first, second]);

    expect(firstOutcome).toEqual({ started: true });
    expect(secondOutcome).toEqual({ started: false });
  });

  it('releases the lock in finally even when the action throws synchronously-rejecting promises', async () => {
    const lock = new DoseActionLock();
    const action = jest.fn().mockRejectedValue(new Error('nope'));

    const outcome = await runLockedAction(lock, 'medication-1', action);

    expect(outcome.started).toBe(true);
    expect(outcome.error).toBeInstanceOf(Error);
    expect(lock.isLocked('medication-1')).toBe(false);
  });
});

describe('runThenRefreshOnSuccess', () => {
  it('runs refreshDoses only after the action succeeds', async () => {
    const refreshDoses = jest.fn().mockResolvedValue(undefined);
    const action = jest.fn().mockResolvedValue('done');

    const result = await runThenRefreshOnSuccess(action, refreshDoses);

    expect(result).toBe('done');
    expect(refreshDoses).toHaveBeenCalledTimes(1);
  });

  it('does not run refreshDoses when the action fails, and re-throws the original error', async () => {
    const refreshDoses = jest.fn().mockResolvedValue(undefined);
    const action = jest.fn().mockRejectedValue(new Error('setActive failed'));

    await expect(runThenRefreshOnSuccess(action, refreshDoses)).rejects.toThrow('setActive failed');
    expect(refreshDoses).not.toHaveBeenCalled();
  });
});
