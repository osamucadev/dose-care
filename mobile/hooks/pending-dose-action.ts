import type { DoseEventStatus, DoseOccurrence } from '@/domain/types';

/** How long "Desfazer" stays available before the action is written. */
export const UNDO_WINDOW_MS = 5_000;
/** Screen reader users need longer to hear the message and reach the button. */
export const UNDO_WINDOW_SCREEN_READER_MS = 10_000;

export interface PendingDoseAction {
  occurrence: DoseOccurrence;
  status: DoseEventStatus;
}

export interface Timers {
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
}

const realTimers: Timers = {
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/**
 * Holds at most one Tomado/Pular action for a short undo window before
 * it becomes a DoseEvent. Nothing is written while the action can still
 * be undone, so "Desfazer" never has to delete history: an undone action
 * simply never existed.
 *
 * The action is written (`commit`) as soon as any of these happens:
 * - the window ends;
 * - another action is scheduled (only one can be pending);
 * - `flush()` is called, which the app does when it leaves the
 *   foreground, so closing the app inside the window still records it.
 *
 * Framework-free so the sequencing is unit tested with fake timers; the
 * React side lives in `pending-dose-action-provider.tsx`.
 */
export class PendingDoseActionQueue {
  private current: { action: PendingDoseAction; timer: unknown } | null = null;

  constructor(
    private readonly commit: (action: PendingDoseAction) => Promise<void>,
    private readonly onChange: (pending: PendingDoseAction | null) => void,
    private readonly windowMs: () => number = () => UNDO_WINDOW_MS,
    private readonly timers: Timers = realTimers
  ) {}

  get pending(): PendingDoseAction | null {
    return this.current?.action ?? null;
  }

  /**
   * Starts the undo window for `action`. A second tap on the occurrence
   * already pending is ignored. Any other pending action is written right
   * away; the returned promise settles when that write is done.
   */
  schedule(action: PendingDoseAction): Promise<void> {
    if (this.current?.action.occurrence.id === action.occurrence.id) return Promise.resolve();
    const previous = this.flush();
    const timer = this.timers.setTimeout(() => void this.flush(), this.windowMs());
    this.current = { action, timer };
    this.onChange(action);
    return previous;
  }

  /** Drops the pending action without writing anything. Returns what was undone. */
  undo(): PendingDoseAction | null {
    if (!this.current) return null;
    const { action, timer } = this.current;
    this.timers.clearTimeout(timer);
    this.current = null;
    this.onChange(null);
    return action;
  }

  /** Writes the pending action now, if there is one. */
  flush(): Promise<void> {
    if (!this.current) return Promise.resolve();
    const { action, timer } = this.current;
    this.timers.clearTimeout(timer);
    this.current = null;
    this.onChange(null);
    return this.commit(action);
  }
}

/**
 * Occurrences as the screen should show them: a pending action, or one
 * written but not reloaded yet, already counts as done. That is what
 * makes the card leave "Agora" the moment the button is tapped.
 */
export function applyDoseActionOverlay(
  occurrences: DoseOccurrence[],
  overlay: ReadonlyMap<string, DoseEventStatus>
): DoseOccurrence[] {
  if (overlay.size === 0) return occurrences;
  return occurrences.map((occurrence) => {
    const status = overlay.get(occurrence.id);
    return status && occurrence.status === 'pending' ? { ...occurrence, status } : occurrence;
  });
}
