import { resolveStorage } from './storage.js';

/**
 * Caché de cliente con expiración (TTL).
 *
 * Cumple el requisito de persistencia de la prueba:
 *   - se guarda la respuesta cada vez que se solicita al API;
 *   - las entradas expiran a la hora y entonces se revalidan contra el API;
 *   - todo el almacenamiento vive en cliente (`localStorage`, con degradación
 *     a memoria si no está disponible).
 *
 * Cada entrada se serializa como `{ v: <valor>, e: <timestamp de expiración> }`.
 * Guardar el instante de expiración —y no el de creación— permite que una
 * entrada escrita con un TTL concreto mantenga ese TTL aunque la
 * configuración global cambie después.
 */

/** TTL exigido por la prueba: 1 hora. */
export const ONE_HOUR_MS = 60 * 60 * 1000;

const DEFAULT_NAMESPACE = 'itx-cache';

/**
 * @typedef {object} CacheEntry
 * @property {unknown} v Valor almacenado.
 * @property {number} e Timestamp (ms) en el que la entrada deja de ser válida.
 */

/**
 * @param {object} [options]
 * @param {string} [options.namespace] Prefijo de las claves en el storage.
 * @param {number} [options.ttlMs] Tiempo de vida por defecto, en ms.
 * @param {Storage} [options.storage] Storage a utilizar (inyectable en tests).
 * @param {() => number} [options.now] Reloj inyectable (inyectable en tests).
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
   * Lee y valida una entrada. Una entrada corrupta o expirada se elimina y se
   * trata como ausente, de modo que la aplicación revalide contra el API.
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
   * @returns {unknown | undefined} El valor cacheado, o `undefined` si no hay
   *   entrada válida.
   */
  function get(key) {
    return read(key).value;
  }

  /**
   * @param {string} key
   * @returns {boolean} `true` si existe una entrada no expirada.
   */
  function has(key) {
    return read(key).hit;
  }

  /**
   * @param {string} key
   * @param {unknown} value
   * @param {number} [entryTtlMs] TTL específico para esta entrada.
   * @returns {boolean} `true` si se pudo persistir.
   */
  function set(key, value, entryTtlMs = ttlMs) {
    /** @type {CacheEntry} */
    const entry = { v: value, e: now() + entryTtlMs };

    try {
      store.setItem(toStorageKey(key), JSON.stringify(entry));
      return true;
    } catch {
      // Cuota agotada: liberamos las entradas de este namespace y reintentamos
      // una sola vez. Si vuelve a fallar, seguimos sin caché en lugar de
      // romper la petición.
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
      /* nada que hacer: la caché es best-effort */
    }
  }

  /** Elimina todas las entradas de este namespace, sin tocar otras claves. */
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
 * Caché compartida por toda la aplicación.
 * El TTL puede ajustarse por entorno; por defecto es el de la prueba, 1 hora.
 */
const configuredTtl = Number(import.meta.env?.VITE_CACHE_TTL_MS);

export const appCache = createCache({
  namespace: 'itx-cache',
  ttlMs: Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : ONE_HOUR_MS,
});
