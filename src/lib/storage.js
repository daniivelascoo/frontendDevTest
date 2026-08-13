/**
 * Fault-tolerant storage adapter.
 *
 * `localStorage` can throw in more cases than it seems: Safari private mode,
 * blocked third-party cookies, exhausted quota, or environments with no
 * `window`. Since the cache is an optimisation and never a requirement for the
 * application to work, any failure degrades to an in-memory `Map` instead of
 * propagating the error.
 */

/**
 * In-memory implementation with the same interface as `Storage`.
 * @returns {Storage}
 */
export function createMemoryStorage() {
  const entries = new Map();

  return {
    get length() {
      return entries.size;
    },
    key(index) {
      return [...entries.keys()][index] ?? null;
    },
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null;
    },
    setItem(key, value) {
      entries.set(key, String(value));
    },
    removeItem(key) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  };
}

/**
 * Checks that a `Storage` is actually usable with a probe write: the mere
 * existence of the object does not guarantee it will not throw on write.
 *
 * @param {Storage | undefined | null} candidate
 * @returns {boolean}
 */
export function isStorageUsable(candidate) {
  if (!candidate) return false;

  const probeKey = '__storage_probe__';
  try {
    candidate.setItem(probeKey, '1');
    candidate.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the best available storage: `localStorage` if it is usable, and an
 * in-memory stand-in otherwise.
 *
 * @param {Storage} [preferred]
 * @returns {Storage}
 */
export function resolveStorage(preferred) {
  if (preferred) {
    return isStorageUsable(preferred) ? preferred : createMemoryStorage();
  }

  const browserStorage = typeof window !== 'undefined' ? window.localStorage : null;
  return isStorageUsable(browserStorage) ? browserStorage : createMemoryStorage();
}
