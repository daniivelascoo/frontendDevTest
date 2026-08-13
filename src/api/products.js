import { request } from './http.js';
import { ENDPOINTS } from './config.js';
import { appCache } from '../lib/cache.js';

/**
 * Products service: the single gateway to the API data.
 *
 * On top of the HTTP client it adds two things:
 *
 * 1. **Cache with TTL** (`src/lib/cache.js`). The cache is consulted before
 *    going to the network; the response is stored whenever the request
 *    succeeds.
 *
 * 2. **De-duplication of in-flight requests.** Without it, React's double mount
 *    in StrictMode — or two components asking for the same product — would fire
 *    duplicate requests before the first one managed to write to the cache.
 */

const CACHE_KEYS = {
  products: 'products',
  product: (id) => `product:${id}`,
};

/** @type {Map<string, Promise<unknown>>} */
const inFlight = new Map();

/**
 * Runs `fetcher`, serving from cache when possible and guaranteeing there are
 * never two simultaneous requests for the same key.
 *
 * Note: the caller's signal is deliberately not propagated to the shared
 * request. If it were, unmounting one component would cancel the request other
 * consumers are waiting on. Cancellation is handled in the hook, which discards
 * the result instead of aborting the network.
 *
 * @template T
 * @param {string} cacheKey
 * @param {() => Promise<T>} fetcher
 * @param {object} [options]
 * @param {boolean} [options.force] Ignores the cache and revalidates against the API.
 * @returns {Promise<T>}
 */
async function withCache(cacheKey, fetcher, { force = false } = {}) {
  if (!force) {
    const cached = appCache.get(cacheKey);
    if (cached !== undefined) return cached;
  }

  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  const promise = fetcher()
    .then((data) => {
      appCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, promise);
  return promise;
}

/**
 * @typedef {object} ProductSummary
 * @property {string} id
 * @property {string} brand
 * @property {string} model
 * @property {string} price Empty string when the product is not for sale.
 * @property {string} imgUrl
 */

/**
 * @typedef {object} ProductOption
 * @property {number} code Code the API expects when adding to the cart.
 * @property {string} name Human-readable label.
 */

/**
 * Fetches the full product catalogue.
 *
 * @param {object} [options]
 * @param {boolean} [options.force]
 * @returns {Promise<ProductSummary[]>}
 */
export async function getProducts({ force = false } = {}) {
  const data = await withCache(CACHE_KEYS.products, () => request(ENDPOINTS.products), { force });

  // The API contract says it returns an array. If one day it does not, an empty
  // list is preferable to the UI blowing up while mapping.
  return Array.isArray(data) ? data : [];
}

/**
 * Fetches a product's detail.
 *
 * @param {string} id
 * @param {object} [options]
 * @param {boolean} [options.force]
 * @returns {Promise<object>}
 */
export async function getProduct(id, { force = false } = {}) {
  return withCache(CACHE_KEYS.product(id), () => request(ENDPOINTS.product(id)), { force });
}

/**
 * Adds a product to the cart.
 *
 * This is a mutation, so it is never cached nor de-duplicated: every click by
 * the user must reach the API.
 *
 * @param {object} selection
 * @param {string} selection.id Product identifier.
 * @param {number} selection.colorCode Code of the chosen colour.
 * @param {number} selection.storageCode Code of the chosen storage.
 * @returns {Promise<{ count: number }>} Number of items in the cart.
 */
export async function addToCart({ id, colorCode, storageCode }) {
  const data = await request(ENDPOINTS.cart, {
    method: 'POST',
    body: { id, colorCode, storageCode },
  });

  const count = Number(data?.count);
  return { count: Number.isFinite(count) ? count : 0 };
}

/** Invalidates the whole API data cache (used by the retry button). */
export function invalidateProductCache() {
  appCache.clear();
  inFlight.clear();
}
