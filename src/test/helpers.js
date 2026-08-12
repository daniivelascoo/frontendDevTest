/**
 * Helpers de test que **no** dependen de React.
 *
 * Están separados de `utils.jsx` a propósito: los tests de lógica pura
 * (`lib/cache.test.js`, `api/products.test.js`) solo necesitan un doble de
 * `fetch` y un `Storage` en memoria, y no tienen por qué arrastrar Testing
 * Library, el router ni los proveedores de la aplicación.
 *
 * Lo que necesite renderizar componentes vive en `utils.jsx`.
 */

/**
 * Sustituye `fetch` por un doble que responde según la URL solicitada.
 *
 * Se hace mock del `fetch` global y no del módulo de servicios a propósito:
 * así los tests ejercitan el cliente HTTP y la caché reales, que es donde
 * están las reglas de negocio que interesa verificar.
 *
 * Gana la **primera** ruta que coincida, así que hay que declarar las más
 * específicas antes (`/api/cart` antes que `/api/product`).
 *
 * @param {Array<{ match: string | RegExp, status?: number, body?: unknown, delayMs?: number }>} routes
 * @returns {import('vitest').Mock}
 */
export function mockFetch(routes) {
  const fetchMock = vi.fn(async (url) => {
    const requestUrl = String(url);

    const route = routes.find(({ match }) =>
      typeof match === 'string' ? requestUrl.includes(match) : match.test(requestUrl)
    );

    if (!route) {
      throw new Error(`No hay respuesta simulada para la URL: ${requestUrl}`);
    }

    if (route.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, route.delayMs));
    }

    const status = route.status ?? 200;

    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (route.body === undefined ? '' : JSON.stringify(route.body)),
    };
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Storage en memoria aislado para un test concreto.
 *
 * @returns {Storage}
 */
export function createTestStorage() {
  const entries = new Map();

  return {
    get length() {
      return entries.size;
    },
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => (entries.has(key) ? entries.get(key) : null),
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
    clear: () => entries.clear(),
  };
}
