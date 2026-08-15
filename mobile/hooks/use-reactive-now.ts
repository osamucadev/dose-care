import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { didReturnToForeground, hasLocalDateChanged, msUntilNextMinute } from '@/domain/clock';
import { toLocalDateString } from '@/domain/datetime';

interface UseReactiveNowOptions {
  /**
   * Called whenever already-loaded occurrences might have gone stale
   * without any user action: the app just returned to the foreground
   * (it may have sat in the background for minutes or hours), or a
   * minute tick crossed into a new local calendar day while the app
   * stayed open. Screens use this to re-fetch occurrences — this hook
   * itself never touches SQLite, it only tracks the clock.
   */
  onStale?: () => void;
}

/**
 * A `Date` that updates itself once a minute — first aligned to the
 * exact next minute boundary (via `msUntilNextMinute`, not "60s after
 * mount"), then on a regular 60s interval — plus immediately whenever
 * the app returns to the foreground.
 *
 * This alone is enough to make "Agora"/"Próximo" reclassify themselves
 * live: screens pass the returned `Date` into `computeNowAndNext` on
 * every render, and that recomputation over already-loaded occurrences
 * is cheap. No polling of SQLite happens here — `onStale` is the only
 * signal to go fetch fresh data, and it only fires on the two events
 * that can make cached occurrences genuinely wrong (foreground return,
 * day rollover), never on every plain minute tick.
 */
export function useReactiveNow({ onStale }: UseReactiveNowOptions = {}): Date {
  const [now, setNow] = useState(() => new Date());
  const dateStrRef = useRef(toLocalDateString(now));
  const appStateRef = useRef(AppState.currentState);
  const onStaleRef = useRef(onStale);
  onStaleRef.current = onStale;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    function advance() {
      const next = new Date();
      setNow(next);
      if (hasLocalDateChanged(dateStrRef.current, next)) {
        dateStrRef.current = toLocalDateString(next);
        onStaleRef.current?.();
      }
    }

    const timeout = setTimeout(() => {
      advance();
      interval = setInterval(advance, 60_000);
    }, msUntilNextMinute(new Date()));

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const cameToForeground = didReturnToForeground(appStateRef.current, nextState);
      appStateRef.current = nextState;
      if (cameToForeground) {
        const next = new Date();
        setNow(next);
        dateStrRef.current = toLocalDateString(next);
        onStaleRef.current?.();
      }
    });

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return now;
}
