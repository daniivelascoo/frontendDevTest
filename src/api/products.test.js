import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addToCart, getProduct, getProducts, invalidateProductCache } from './products.js';
import { ApiError } from './http.js';
import { productDetailFixture, productListFixture } from '../test/fixtures.js';
import { mockFetch } from '../test/helpers.js';

/**
 * Estos tests ejercitan el servicio real contra un `fetch` simulado, de modo
 * que se verifica la integración entre cliente HTTP, caché y deduplicación —
 * que es donde vive el requisito de cacheo del enunciado.
 */
describe('servicio de productos', () => {
  beforeEach(() => {
    // La caché y el registro de peticiones en vuelo son singletons de módulo.
    invalidateProductCache();
  });

  describe('getProducts', () => {
    it('devuelve el catálogo del API', async () => {
      mockFetch([{ match: '/api/product', body: productListFixture }]);

      await expect(getProducts()).resolves.toEqual(productListFixture);
    });

    it('sirve la segunda llamada desde la caché, sin volver a la red', async () => {
      const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

      await getProducts();
      await getProducts();

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('vuelve al API cuando se fuerza la revalidación', async () => {
      const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

      await getProducts();
      await getProducts({ force: true });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('agrupa en una sola petición las llamadas simultáneas', async () => {
      const fetchMock = mockFetch([
        { match: '/api/product', body: productListFixture, delayMs: 10 },
      ]);

      // Es el escenario del doble montaje de StrictMode.
      const [first, second] = await Promise.all([getProducts(), getProducts()]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(first).toEqual(second);
    });

    it('no cachea la respuesta si la petición falla', async () => {
      const fetchMock = mockFetch([{ match: '/api/product', status: 500 }]);

      await expect(getProducts()).rejects.toBeInstanceOf(ApiError);

      // La siguiente llamada debe reintentar, no servir un error cacheado.
      await expect(getProducts()).rejects.toBeInstanceOf(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('devuelve una lista vacía si el API no responde con un array', async () => {
      mockFetch([{ match: '/api/product', body: { error: 'formato inesperado' } }]);

      await expect(getProducts()).resolves.toEqual([]);
    });
  });

  describe('getProduct', () => {
    it('pide el detalle por identificador', async () => {
      const fetchMock = mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

      await expect(getProduct('ZmGrkLRPXOTpxsU4jjAcv')).resolves.toEqual(productDetailFixture);
      expect(fetchMock.mock.calls[0][0]).toContain('/api/product/ZmGrkLRPXOTpxsU4jjAcv');
    });

    it('cachea cada producto por separado', async () => {
      const fetchMock = mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

      await getProduct('uno');
      await getProduct('uno');
      await getProduct('dos');

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('marca los productos inexistentes como no encontrados', async () => {
      mockFetch([{ match: '/api/product/', status: 404 }]);

      const error = await getProduct('inexistente').catch((caught) => caught);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      // `isNotFound` es un getter del prototipo, así que se comprueba directamente.
      expect(error.isNotFound).toBe(true);
    });
  });

  describe('addToCart', () => {
    it('envía identificador, color y almacenamiento en el cuerpo', async () => {
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

    it('nunca se cachea: cada pulsación llega al API', async () => {
      const fetchMock = mockFetch([{ match: '/api/cart', body: { count: 1 } }]);

      await addToCart({ id: 'abc', colorCode: 1000, storageCode: 2000 });
      await addToCart({ id: 'abc', colorCode: 1000, storageCode: 2000 });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('normaliza a cero un contador que el API no devuelva', async () => {
      mockFetch([{ match: '/api/cart', body: {} }]);

      await expect(addToCart({ id: 'abc', colorCode: 1, storageCode: 2 })).resolves.toEqual({
        count: 0,
      });
    });
  });

  describe('errores de red', () => {
    it('traduce un fallo de conexión a un ApiError reintentable', async () => {
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
