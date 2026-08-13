import { useCallback } from 'react';
import { getProduct } from '../api/products.js';
import { useAsyncResource } from './useAsyncResource.js';

/**
 * Detail of a specific product.
 *
 * @param {string | undefined} id Product identifier.
 * @returns {{
 *   product: object | null,
 *   status: import('./useAsyncResource.js').ResourceStatus,
 *   error: Error | null,
 *   isLoading: boolean,
 *   reload: (options?: { force?: boolean }) => void
 * }}
 */
export function useProduct(id) {
  const fetcher = useCallback(({ force }) => getProduct(id, { force }), [id]);

  const { data, status, error, isLoading, reload } = useAsyncResource(fetcher, {
    enabled: Boolean(id),
    deps: [id],
  });

  return { product: data, status, error, isLoading, reload };
}
