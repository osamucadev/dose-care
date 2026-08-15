import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Shared loading/error/data plumbing for screens backed by the SQLite
 * repositories. `refresh` re-runs `fetcher`; a stale in-flight request
 * is ignored if a newer one starts before it resolves.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncDataState<T> & { refresh: () => void } {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestIdRef = useRef(0);

  const refresh = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef.current()
      .then((data) => {
        if (requestIdRef.current === requestId) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (requestIdRef.current === requestId) {
          setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
        }
      });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, deps);

  return { ...state, refresh };
}
