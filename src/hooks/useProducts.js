import { useCallback, useMemo } from 'react';
import { getProducts } from '../api/products.js';
import { filterProducts } from '../lib/search.js';
import { useAsyncResource } from './useAsyncResource.js';
import { useDebouncedValue } from './useDebouncedValue.js';

/**
 * Catálogo de productos, ya filtrado por el criterio de búsqueda.
 *
 * El filtrado ocurre en cliente sobre la lista completa que devuelve el API:
 * son 100 productos y un único endpoint sin parámetros de búsqueda, así que
 * filtrar en memoria es instantáneo y no genera tráfico adicional.
 *
 * @param {string} [query] Criterio de búsqueda del usuario.
 * @returns {{
 *   products: object[],
 *   allProducts: object[],
 *   status: import('./useAsyncResource.js').ResourceStatus,
 *   error: Error | null,
 *   isLoading: boolean,
 *   isFiltering: boolean,
 *   reload: (options?: { force?: boolean }) => void
 * }}
 */
export function useProducts(query = '') {
  const fetcher = useCallback(({ force }) => getProducts({ force }), []);

  const { data, status, error, isLoading, reload } = useAsyncResource(fetcher);

  const debouncedQuery = useDebouncedValue(query, 250);

  const allProducts = useMemo(() => data ?? [], [data]);

  const products = useMemo(
    () => filterProducts(allProducts, debouncedQuery),
    [allProducts, debouncedQuery]
  );

  return {
    products,
    allProducts,
    status,
    error,
    isLoading,
    // El usuario ya ha escrito pero la lista todavía refleja la consulta
    // anterior: útil para atenuar el grid mientras se estabiliza.
    isFiltering: query.trim() !== debouncedQuery.trim(),
    reload,
  };
}
