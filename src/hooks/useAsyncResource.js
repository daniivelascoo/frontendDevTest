import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {'idle' | 'loading' | 'success' | 'error'} ResourceStatus
 */

/**
 * Carga un recurso asíncrono exponiendo una máquina de estados explícita.
 *
 * Un único `status` en lugar de varios booleanos sueltos evita los estados
 * imposibles (`loading` y `error` a la vez) y hace que la UI sea un `switch`.
 *
 * Al desmontar o al relanzar la carga, el resultado en vuelo se descarta en
 * lugar de abortarse: la petición sigue viva para que su resultado llegue a la
 * caché compartida y la aproveche el siguiente consumidor.
 *
 * @template T
 * @param {(options: { signal: AbortSignal }) => Promise<T>} fetcher
 * @param {object} [options]
 * @param {boolean} [options.enabled] Si es `false`, no se lanza la carga.
 * @param {unknown[]} [options.deps] Dependencias que reinician la carga.
 * @returns {{ data: T | null, status: ResourceStatus, error: Error | null, reload: (options?: { force?: boolean }) => void, isLoading: boolean }}
 */
export function useAsyncResource(fetcher, { enabled = true, deps = [] } = {}) {
  const [state, setState] = useState({ data: null, status: 'idle', error: null });

  // Cada carga recibe un identificador; solo la más reciente puede escribir en
  // el estado. Así una respuesta lenta no pisa a otra más nueva.
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
    // `deps` es la lista de dependencias del llamante; es intencional que ESLint
    // no pueda analizarla estáticamente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, ...deps]
  );

  useEffect(() => {
    const cancel = load();
    return () => {
      // Invalida la carga en curso para que no escriba tras el desmontaje.
      requestIdRef.current += 1;
      cancel();
    };
  }, [load]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    // `idle` cuenta como carga solo si el recurso está habilitado: si no lo
    // está, nunca llegará a cargar y la UI no debe mostrar un spinner eterno.
    isLoading: enabled && (state.status === 'loading' || state.status === 'idle'),
    reload: load,
  };
}
