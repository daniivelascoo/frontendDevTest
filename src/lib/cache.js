import { resolveStorage } from './storage.js';

/**
 * Client-side cache with expiry (TTL).
 *
 * It fulfils the persistence requirement of the test:
 *   - the response is stored every time the API is queried;
 *   - entries expire after an hour and are then revalidated against the API;
 *   - all storage lives on the client (`localStorage`, degrading to memory if
 *     it is unavailable).
 *
 * Each entry is serialised as `{ v: <value>, e: <expiry timestamp> }`. Storing
 * the expiry instant — rather than the creation instant — lets an entry written
 * with a specific TTL keep that TTL even if the global configuration changes
 * afterwards.
 */

/** TTL required by the test: 1 hour. */
export const ONE_HOUR_MS = 60 * 60 * 1000;

const DEFAULT_NAMESPACE = 'itx-cache';

/**
 * @typedef {object} CacheEntry
 * @property {unknown} v Stored value.
 * @property {number} e Timestamp (ms) at which the entry stops being valid.
 */

/**
 * @param {object} [options]
 * @param {string} [options.namespace] Prefix for the keys in storage.
 * @param {number} [options.ttlMs] Default time to live, in ms.
 * @param {Storage} [options.storage] Storage to use (injectable in tests).
 * @param {() => number} [options.now] Clock (injectable in tests).
 */
export function createCache({
  namespace = DEFAULT_NAMESPACE,
  ttlMs = ONE_HOUR_MS,
  storage,
  now = () => Date.now(),
} = {}) {
  const store = resolveStorage(storage);
  const prefix = `${namespace}:`;

  const toStorageKey = (key) => `${prefix}${key}`;

  /**
   * Reads and validates an entry. A corrupt or expired entry is removed and
   * treated as absent, so the application revalidates against the API.
   *
   * @param {string} key
   * @returns {{ hit: boolean, value?: unknown, expiresAt?: number }}
   */
  function read(key) {
    let raw;
    try {
      raw = store.getItem(toStorageKey(key));
    } catch {
      return { hit: false };
    }

    if (raw === null || raw === undefined) return { hit: false };

    let entry;
    try {
      entry = JSON.parse(raw);
    } catch {
      remove(key);
      return { hit: false };
    }

    const isWellFormed =
      entry !== null && typeof entry === 'object' && typeof entry.e === 'number' && 'v' in entry;

    if (!isWellFormed) {
      remove(key);
      return { hit: false };
    }

    if (now() >= entry.e) {
      remove(key);
      return { hit: false };
    }

    return { hit: true, value: entry.v, expiresAt: entry.e };
  }

  /**
   * @param {string} key
   * @returns {unknown | undefined} The cached value, or `undefined` if there is
   *   no valid entry.
   */
  function get(key) {
    return read(key).value;
  }

  /**
   * @param {string} key
   * @returns {boolean} `true` if a non-expired entry exists.
   */
  function has(key) {
    return read(key).hit;
  }

  /**
   * @param {string} key
   * @param {unknown} value
   * @param {number} [entryTtlMs] TTL specific to this entry.
   * @returns {boolean} `true` if it could be persisted.
   */
  function set(key, value, entryTtlMs = ttlMs) {
    /** @type {CacheEntry} */
    const entry = { v: value, e: now() + entryTtlMs };

    try {
      store.setItem(toStorageKey(key), JSON.stringify(entry));
      return true;
    } catch {
      // Quota exhausted: free the entries in this namespace and retry once. If
      // it fails again, carry on without a cache rather than breaking the
      // request.
      clear();
      try {
        store.setItem(toStorageKey(key), JSON.stringify(entry));
        return true;
      } catch {
        return false;
      }
    }
  }

  /** @param {string} key */
  function remove(key) {
    try {
      store.removeItem(toStorageKey(key));
    } catch {
      /* nothing to do: the cache is best-effort */
    }
  }

  /** Removes every entry in this namespace, leaving other keys untouched. */
  function clear() {
    try {
      const keys = [];
      for (let i = 0; i < store.length; i += 1) {
        const storageKey = store.key(i);
        if (storageKey && storageKey.startsWith(prefix)) keys.push(storageKey);
      }
      keys.forEach((storageKey) => store.removeItem(storageKey));
    } catch {
      /* best-effort */
    }
  }

  return { get, set, has, remove, clear, read, ttlMs, namespace };
}

/**
 * Cache shared by the whole application.
 * The TTL can be tuned per environment; it defaults to the test's one hour.
 */
const configuredTtl = Number(import.meta.env?.VITE_CACHE_TTL_MS);

export const appCache = createCache({
  namespace: 'itx-cache',
  ttlMs: Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : ONE_HOUR_MS,
});
