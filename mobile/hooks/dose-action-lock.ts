/**
 * Synchronous guard against starting two operations for the same key at
 * once. Deliberately framework-free (no React) so it can be unit
 * tested directly without rendering anything — `useDoseActionHandler`
 * just holds one instance per hook call via `useRef`, so state is
 * scoped to that component instance, never a module-level global.
 */
export class DoseActionLock {
  private readonly inFlight = new Set<string>();

  /** True if `key` is already being processed. Check this synchronously before doing any work. */
  isLocked(key: string): boolean {
    return this.inFlight.has(key);
  }

  /** Marks `key` as in-flight. Call synchronously, before the first `await`. */
  acquire(key: string): void {
    this.inFlight.add(key);
  }

  /** Releases `key`. Safe to call even if it was never acquired. */
  release(key: string): void {
    this.inFlight.delete(key);
  }
}
