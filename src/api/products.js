import { request } from './http.js';
import { ENDPOINTS } from './config.js';
import { appCache } from '../lib/cache.js';

/**
 * Servicio de productos: única puerta de entrada a los datos del API.
 *
 * Sobre el cliente HTTP añade dos cosas:
 *
 * 1. **Caché con TTL** (`src/lib/cache.js`). Antes de salir a red se consulta
 *    la caché; la respuesta se guarda siempre que la petición tenga éxito.
 *
 * 2. **Deduplicación de peticiones en vuelo.** Sin ella, el doble montaje de
 *    React en StrictMode —o dos componentes pidiendo el mismo producto—
 *    dispararían peticiones duplicadas antes de que la primera llegue a
 *    escribir en caché.
 */

const CACHE_KEYS = {
  products: 'products',
  product: (id) => `product:${id}`,
};

/** @type {Map<string, Promise<unknown>>} */
const inFlight = new Map();

/**
 * Ejecuta `fetcher` sirviendo desde caché cuando sea posible y garantizando
 * que no haya dos peticiones simultáneas para la misma clave.
 *
 * Nota: la señal del llamante no se propaga a la petición compartida a
 * propósito. Si lo hiciera, desmontar un componente cancelaría la petición
 * que otros consumidores están esperando. La cancelación se gestiona en el
 * hook, descartando el resultado en lugar de abortar la red.
 *
 * @template T
 * @param {string} cacheKey
 * @param {() => Promise<T>} fetcher
 * @param {object} [options]
 * @param {boolean} [options.force] Ignora la caché y revalida contra el API.
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
 * @property {string} price Cadena vacía cuando el producto no está a la venta.
 * @property {string} imgUrl
 */

/**
 * @typedef {object} ProductOption
 * @property {number} code Código que espera el API al añadir a la cesta.
 * @property {string} name Etiqueta legible.
 */

/**
 * Obtiene el catálogo completo de productos.
 *
 * @param {object} [options]
 * @param {boolean} [options.force]
 * @returns {Promise<ProductSummary[]>}
 */
export async function getProducts({ force = false } = {}) {
  const data = await withCache(CACHE_KEYS.products, () => request(ENDPOINTS.products), { force });

  // El contrato del API dice que devuelve un array. Si algún día no lo hace,
  // preferimos una lista vacía a que la UI reviente al mapear.
  return Array.isArray(data) ? data : [];
}

/**
 * Obtiene el detalle de un producto.
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
 * Añade un producto a la cesta.
 *
 * Es una mutación, así que nunca se cachea ni se deduplica: cada pulsación del
 * usuario debe llegar al API.
 *
 * @param {object} selection
 * @param {string} selection.id Identificador del producto.
 * @param {number} selection.colorCode Código del color elegido.
 * @param {number} selection.storageCode Código del almacenamiento elegido.
 * @returns {Promise<{ count: number }>} Número de artículos en la cesta.
 */
export async function addToCart({ id, colorCode, storageCode }) {
  const data = await request(ENDPOINTS.cart, {
    method: 'POST',
    body: { id, colorCode, storageCode },
  });

  const count = Number(data?.count);
  return { count: Number.isFinite(count) ? count : 0 };
}

/** Invalida toda la caché de datos del API (usado por el botón de reintentar). */
export function invalidateProductCache() {
  appCache.clear();
  inFlight.clear();
}
