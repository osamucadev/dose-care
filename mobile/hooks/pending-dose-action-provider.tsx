import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

import type { DoseEventStatus } from '@/domain/types';
import type { StoredPendingDoseAction } from '@/domain/validation';
import * as doseService from '@/services/dose-service';

import {
  PendingDoseActionQueue,
  UNDO_WINDOW_MS,
  UNDO_WINDOW_SCREEN_READER_MS,
  type PendingDoseAction,
} from './pending-dose-action';

interface PendingDoseActionContextValue {
  /** The action that can still be undone, if any. */
  pending: PendingDoseAction | null;
  /** Pending and just-written actions, by occurrence id, for screens to show as done right away. */
  overlay: ReadonlyMap<string, DoseEventStatus>;
  /** Bumped after every write, so every list of doses (and the history) reloads. */
  writeVersion: number;
  hasWriteError: boolean;
  dismissWriteError: () => void;
  schedule: (action: PendingDoseAction) => void;
  undo: () => void;
}

const EMPTY_OVERLAY: ReadonlyMap<string, DoseEventStatus> = new Map();

const PendingDoseActionContext = createContext<PendingDoseActionContextValue>({
  pending: null,
  overlay: EMPTY_OVERLAY,
  writeVersion: 0,
  hasWriteError: false,
  dismissWriteError: () => {},
  schedule: () => {},
  undo: () => {},
});

/**
 * App-wide home of the Tomado/Pular undo window (see
 * `PendingDoseActionQueue`). It lives at the root, not in a screen, so
 * the pending action survives navigation and is written no matter which
 * screen is open.
 *
 * Closing the app inside the window must not lose the tap. Android keeps
 * the app "active" while it sits in the recents screen, so swiping it
 * away there kills it with no background event at all. Hence:
 * - the action is stored in pending_dose_actions the moment it is tapped
 *   (undo deletes that row; it is not history);
 * - on every launch, rows left there are committed, since the user never
 *   undid them;
 * - as a fast path, the action is also committed as soon as the app
 *   leaves the foreground or its window loses focus (`blur`, which fires
 *   when recents opens).
 */
export function PendingDoseActionProvider({ children }: PropsWithChildren) {
  const [pending, setPending] = useState<PendingDoseAction | null>(null);
  const [written, setWritten] = useState<ReadonlyMap<string, DoseEventStatus>>(EMPTY_OVERLAY);
  const [writeVersion, setWriteVersion] = useState(0);
  const [hasWriteError, setHasWriteError] = useState(false);
  const screenReaderRef = useRef(false);
  // Storage calls run one after another, so an undo never overtakes the
  // save it cancels and a commit always finds its saved row.
  const storageRef = useRef<Promise<unknown>>(Promise.resolve());
  const storedRef = useRef(new Map<string, StoredPendingDoseAction>());

  const queueRef = useRef<PendingDoseActionQueue | null>(null);
  if (!queueRef.current) {
    queueRef.current = new PendingDoseActionQueue(
      async ({ occurrence, status }) => {
        try {
          await storageRef.current.catch(() => {});
          const stored = storedRef.current.get(occurrence.id);
          // The save failed (the database is unavailable): store it now,
          // so the commit below still has the moment of the tap.
          await doseService.commitDoseAction(stored ?? (await doseService.holdDoseAction(occurrence, status)));
          storedRef.current.delete(occurrence.id);
          // Kept as done until the lists reload, so the card does not
          // flash back between the write and the refresh.
          setWritten((current) => new Map(current).set(occurrence.id, status));
        } catch {
          // Already-recorded is not an error (commitDoseAction resolves
          // it); anything else is a write the user should know about.
          setHasWriteError(true);
        } finally {
          setWriteVersion((v) => v + 1);
        }
      },
      setPending,
      () => (screenReaderRef.current ? UNDO_WINDOW_SCREEN_READER_MS : UNDO_WINDOW_MS)
    );
  }

  useEffect(() => {
    const queue = queueRef.current!;
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      screenReaderRef.current = enabled;
    });
    const screenReader = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      screenReaderRef.current = enabled;
    });
    const appState = AppState.addEventListener('change', (next) => {
      if (next !== 'active') void queue.flush();
    });
    // Android only: the window loses focus when recents or the shade opens.
    const blur = AppState.addEventListener('blur', () => void queue.flush());

    doseService
      .commitLeftoverDoseActions()
      .then((written) => {
        if (written > 0) setWriteVersion((v) => v + 1);
      })
      .catch(() => setHasWriteError(true));

    return () => {
      screenReader.remove();
      appState.remove();
      blur.remove();
      void queue.flush();
    };
  }, []);

  const schedule = useCallback((action: PendingDoseAction) => {
    if (queueRef.current!.pending?.occurrence.id === action.occurrence.id) return;
    setHasWriteError(false);
    const { occurrence, status } = action;
    storageRef.current = storageRef.current
      .catch(() => {})
      .then(() => doseService.holdDoseAction(occurrence, status))
      .then((stored) => storedRef.current.set(occurrence.id, stored));
    void queueRef.current!.schedule(action);
  }, []);

  const undo = useCallback(() => {
    const undone = queueRef.current!.undo();
    if (!undone) return;
    const id = undone.occurrence.id;
    storedRef.current.delete(id);
    storageRef.current = storageRef.current.catch(() => {}).then(() => doseService.releaseDoseAction(id));
  }, []);
  const dismissWriteError = useCallback(() => setHasWriteError(false), []);

  const overlay = useMemo(() => {
    if (!pending) return written;
    return new Map(written).set(pending.occurrence.id, pending.status);
  }, [pending, written]);

  const value = useMemo(
    () => ({ pending, overlay, writeVersion, hasWriteError, dismissWriteError, schedule, undo }),
    [pending, overlay, writeVersion, hasWriteError, dismissWriteError, schedule, undo]
  );

  return <PendingDoseActionContext.Provider value={value}>{children}</PendingDoseActionContext.Provider>;
}

export function usePendingDoseAction(): PendingDoseActionContextValue {
  return useContext(PendingDoseActionContext);
}
