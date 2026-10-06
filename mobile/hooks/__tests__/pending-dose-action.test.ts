import type { DoseOccurrence } from '@/domain/types';

import { applyDoseActionOverlay, PendingDoseActionQueue, type PendingDoseAction } from '../pending-dose-action';

function occurrence(id: string, overrides: Partial<DoseOccurrence> = {}): DoseOccurrence {
  return {
    id,
    profileId: 'p',
    medicationId: 'm',
    medicationName: 'Losartana',
    dosage: '50 mg',
    quantityPerDose: null,
    scheduledAt: '2026-10-04T08:00',
    status: 'pending',
    event: null,
    allowEarly: false,
    ...overrides,
  };
}

function setup(windowMs = 5_000) {
  const committed: PendingDoseAction[] = [];
  const changes: (PendingDoseAction | null)[] = [];
  const queue = new PendingDoseActionQueue(
    async (action) => {
      committed.push(action);
    },
    (pending) => changes.push(pending),
    () => windowMs
  );
  return { queue, committed, changes };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('PendingDoseActionQueue', () => {
  it('writes nothing during the window and writes once when it ends', () => {
    const { queue, committed } = setup();
    queue.schedule({ occurrence: occurrence('a'), status: 'skipped' });

    jest.advanceTimersByTime(4_999);
    expect(committed).toEqual([]);
    expect(queue.pending?.status).toBe('skipped');

    jest.advanceTimersByTime(1);
    expect(committed.map((c) => c.occurrence.id)).toEqual(['a']);
    expect(queue.pending).toBeNull();

    jest.advanceTimersByTime(60_000);
    expect(committed).toHaveLength(1);
  });

  it('never writes an undone action', () => {
    const { queue, committed, changes } = setup();
    queue.schedule({ occurrence: occurrence('a'), status: 'taken' });

    expect(queue.undo()?.occurrence.id).toBe('a');
    jest.advanceTimersByTime(60_000);

    expect(committed).toEqual([]);
    expect(changes.at(-1)).toBeNull();
  });

  it('writes the pending action right away when the app asks to flush (e.g. leaving the foreground)', async () => {
    const { queue, committed } = setup();
    queue.schedule({ occurrence: occurrence('a'), status: 'taken' });

    await queue.flush();

    expect(committed.map((c) => c.status)).toEqual(['taken']);
    expect(queue.undo()).toBeNull();
    jest.advanceTimersByTime(60_000);
    expect(committed).toHaveLength(1);
  });

  it('writes the previous action when another one is scheduled, keeping only the new one undoable', async () => {
    const { queue, committed } = setup();
    queue.schedule({ occurrence: occurrence('a'), status: 'taken' });
    await queue.schedule({ occurrence: occurrence('b'), status: 'skipped' });

    expect(committed.map((c) => c.occurrence.id)).toEqual(['a']);
    expect(queue.pending?.occurrence.id).toBe('b');
  });

  it('ignores a second tap on the occurrence that is already pending', () => {
    const { queue, committed, changes } = setup();
    queue.schedule({ occurrence: occurrence('a'), status: 'taken' });
    queue.schedule({ occurrence: occurrence('a'), status: 'skipped' });

    expect(queue.pending?.status).toBe('taken');
    expect(changes).toHaveLength(1);
    jest.advanceTimersByTime(5_000);
    expect(committed).toHaveLength(1);
  });

  it('uses the window it is given, e.g. a longer one with a screen reader on', () => {
    const { queue, committed } = setup(10_000);
    queue.schedule({ occurrence: occurrence('a'), status: 'taken' });
    jest.advanceTimersByTime(9_999);
    expect(committed).toEqual([]);
    jest.advanceTimersByTime(1);
    expect(committed).toHaveLength(1);
  });

  it('does nothing when there is nothing pending', async () => {
    const { queue, committed, changes } = setup();
    expect(queue.undo()).toBeNull();
    await queue.flush();
    expect(committed).toEqual([]);
    expect(changes).toEqual([]);
  });
});

describe('applyDoseActionOverlay', () => {
  it('shows pending and just-written actions as done', () => {
    const shown = applyDoseActionOverlay(
      [occurrence('a'), occurrence('b'), occurrence('c')],
      new Map([
        ['a', 'skipped'],
        ['c', 'taken'],
      ])
    );
    expect(shown.map((o) => o.status)).toEqual(['skipped', 'pending', 'taken']);
  });

  it('never overrides what is already persisted', () => {
    const shown = applyDoseActionOverlay([occurrence('a', { status: 'taken' })], new Map([['a', 'skipped']]));
    expect(shown[0].status).toBe('taken');
  });
});
