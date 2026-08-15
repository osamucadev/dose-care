import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Shared loading/error/data plumbing for screens backed by the SQLite
 * repositories. `refresh` re-runs `fetcher` and resolves once the fetch
 * has completed and `setState` has been called with the result —
 * **not** once React has actually re-rendered with that new state.
 * `setState` only schedules a render; awaiting `refresh()` tells you
 * the fetch is done and an update is queued, nothing more. Do not rely
 * on `await refresh()` as a way to guarantee stale data is off the
 * screen before further user input — see `useDoseActionHandler` for
 * the synchronous lock that actually provides that guarantee.
 * A stale in-flight request is ignored if a newer one starts before it
 * resolves.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncDataState<T> & { refresh: () => Promise<void> } {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (requestIdRef.current === requestId) setState({ data, loading: false, error: null });
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refresh };
}
