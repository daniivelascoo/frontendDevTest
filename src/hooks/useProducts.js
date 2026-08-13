import { useCallback, useMemo } from 'react';
import { getProducts } from '../api/products.js';
import { filterProducts } from '../lib/search.js';
import { useAsyncResource } from './useAsyncResource.js';
import { useDebouncedValue } from './useDebouncedValue.js';

/**
 * Product catalogue, already filtered by the search term.
 *
 * Filtering happens on the client over the full list returned by the API: there
 * are 100 products and a single endpoint with no search parameters, so
 * filtering in memory is instant and generates no extra traffic.
 *
 * @param {string} [query] The user's search term.
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
    // The user has already typed but the list still reflects the previous
    // query: useful to dim the grid while it settles.
    isFiltering: query.trim() !== debouncedQuery.trim(),
    reload,
  };
}
