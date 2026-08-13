import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addToCart, getProduct, getProducts, invalidateProductCache } from './products.js';
import { ApiError } from './http.js';
import { productDetailFixture, productListFixture } from '../test/fixtures.js';
import { mockFetch } from '../test/helpers.js';

/**
 * These tests exercise the real service against a stubbed `fetch`, so they
 * verify the integration between HTTP client, cache and de-duplication — which
 * is where the brief's caching requirement lives.
 */
describe('products service', () => {
  beforeEach(() => {
    // The cache and the in-flight registry are module singletons.
    invalidateProductCache();
  });

  describe('getProducts', () => {
    it('returns the catalogue from the API', async () => {
      mockFetch([{ match: '/api/product', body: productListFixture }]);

      await expect(getProducts()).resolves.toEqual(productListFixture);
    });

    it('serves the second call from the cache, without hitting the network', async () => {
      const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

      await getProducts();
      await getProducts();

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('goes back to the API when revalidation is forced', async () => {
      const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

      await getProducts();
      await getProducts({ force: true });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('collapses simultaneous calls into a single request', async () => {
      const fetchMock = mockFetch([
        { match: '/api/product', body: productListFixture, delayMs: 10 },
      ]);

      // This is the StrictMode double-mount scenario.
      const [first, second] = await Promise.all([getProducts(), getProducts()]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(first).toEqual(second);
    });

    it('does not cache the response when the request fails', async () => {
      const fetchMock = mockFetch([{ match: '/api/product', status: 500 }]);

      await expect(getProducts()).rejects.toBeInstanceOf(ApiError);

      // The next call must retry, not serve a cached error.
      await expect(getProducts()).rejects.toBeInstanceOf(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('returns an empty list if the API does not respond with an array', async () => {
      mockFetch([{ match: '/api/product', body: { error: 'formato inesperado' } }]);

      await expect(getProducts()).resolves.toEqual([]);
    });
  });

  describe('getProduct', () => {
    it('requests the detail by identifier', async () => {
      const fetchMock = mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

      await expect(getProduct('ZmGrkLRPXOTpxsU4jjAcv')).resolves.toEqual(productDetailFixture);
      expect(fetchMock.mock.calls[0][0]).toContain('/api/product/ZmGrkLRPXOTpxsU4jjAcv');
    });

    it('caches each product separately', async () => {
      const fetchMock = mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

      await getProduct('uno');
      await getProduct('uno');
      await getProduct('dos');

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('flags non-existent products as not found', async () => {
      mockFetch([{ match: '/api/product/', status: 404 }]);

      const error = await getProduct('inexistente').catch((caught) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      // `isNotFound` is a prototype getter, so it is checked directly.
      expect(error.isNotFound).toBe(true);
    });
  });

  describe('addToCart', () => {
    it('sends identifier, colour and storage in the body', async () => {
      const fetchMock = mockFetch([{ match: '/api/cart', body: { count: 3 } }]);

      const result = await addToCart({ id: 'abc', colorCode: 1000, storageCode: 2000 });

      expect(result).toEqual({ count: 3 });

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toContain('/api/cart');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({
        id: 'abc',
        colorCode: 1000,
        storageCode: 2000,
      });
    });

    it('is never cached: every click reaches the API', async () => {
      const fetchMock = mockFetch([{ match: '/api/cart', body: { count: 1 } }]);

      await addToCart({ id: 'abc', colorCode: 1000, storageCode: 2000 });
      await addToCart({ id: 'abc', colorCode: 1000, storageCode: 2000 });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('normalises to zero a counter the API does not return', async () => {
      mockFetch([{ match: '/api/cart', body: {} }]);

      await expect(addToCart({ id: 'abc', colorCode: 1, storageCode: 2 })).resolves.toEqual({
        count: 0,
      });
    });
  });

  describe('network errors', () => {
    it('translates a connection failure into a retryable ApiError', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
      );

      const error = await getProducts().catch((caught) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.kind).toBe('network');
      expect(error.isRetryable).toBe(true);
    });
  });
});
