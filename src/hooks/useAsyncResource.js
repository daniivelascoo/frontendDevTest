import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {'idle' | 'loading' | 'success' | 'error'} ResourceStatus
 */

/**
 * Loads an async resource exposing an explicit state machine.
 *
 * A single `status` instead of several loose booleans rules out impossible
 * states (`loading` and `error` at once) and turns the UI into a `switch`.
 *
 * On unmount, or when the load is restarted, the in-flight result is discarded
 * rather than aborted: the request stays alive so its result reaches the shared
 * cache and the next consumer can use it.
 *
 * @template T
 * @param {(options: { signal: AbortSignal }) => Promise<T>} fetcher
 * @param {object} [options]
 * @param {boolean} [options.enabled] When `false`, the load is not started.
 * @param {unknown[]} [options.deps] Dependencies that restart the load.
 * @returns {{ data: T | null, status: ResourceStatus, error: Error | null, reload: (options?: { force?: boolean }) => void, isLoading: boolean }}
 */
export function useAsyncResource(fetcher, { enabled = true, deps = [] } = {}) {
  const [state, setState] = useState({ data: null, status: 'idle', error: null });

  // Every load gets an identifier; only the most recent one may write to state.
  // That stops a slow response from overwriting a newer one.
  const requestIdRef = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(
    ({ force = false } = {}) => {
      if (!enabled) return () => {};

      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      const controller = new AbortController();

      setState((previous) => ({ ...previous, status: 'loading', error: null }));

      fetcherRef
        .current({ signal: controller.signal, force })
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          setState({ data, status: 'success', error: null });
        })
        .catch((error) => {
          if (requestId !== requestIdRef.current) return;
          if (controller.signal.aborted) return;
          setState({ data: null, status: 'error', error });
        });

      return () => controller.abort();
    },
    // `deps` is the caller's dependency list; ESLint not being able to analyse
    // it statically is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, ...deps]
  );

  useEffect(() => {
    const cancel = load();
    return () => {
      // Invalidates the in-flight load so it does not write after unmount.
      requestIdRef.current += 1;
      cancel();
    };
  }, [load]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    // `idle` counts as loading only when the resource is enabled: if it is not,
    // it will never load and the UI must not show an eternal spinner.
    isLoading: enabled && (state.status === 'loading' || state.status === 'idle'),
    reload: load,
  };
}
