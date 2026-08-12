/**
 * Adaptador de almacenamiento tolerante a fallos.
 *
 * `localStorage` puede lanzar excepciones en más casos de los que parece:
 * modo privado de Safari, cookies de terceros bloqueadas, cuota agotada o
 * entornos sin `window`. Como la caché es una optimización y nunca un
 * requisito para que la aplicación funcione, cualquier fallo degrada a un
 * `Map` en memoria en lugar de propagar el error.
 */

/**
 * Implementación en memoria con la misma interfaz que `Storage`.
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
 * Comprueba que un `Storage` es realmente utilizable con una escritura de
 * prueba: la mera existencia del objeto no garantiza que no lance al escribir.
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
 * Devuelve el mejor almacenamiento disponible: `localStorage` si es usable,
 * y si no un sustituto en memoria.
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
