import { describe, expect, it, vi } from 'vitest';
import { createCache, ONE_HOUR_MS } from './cache.js';
import { createTestStorage } from '../test/helpers.js';

/**
 * La expiración a la hora es un requisito explícito del enunciado, así que se
 * verifica con un reloj inyectado en lugar de con esperas reales.
 */
describe('createCache', () => {
  /** Crea una caché con reloj controlable. */
  function setup({ ttlMs = ONE_HOUR_MS } = {}) {
    let currentTime = 1_700_000_000_000;

    const cache = createCache({
      namespace: 'test',
      ttlMs,
      storage: createTestStorage(),
      now: () => currentTime,
    });

    return {
      cache,
      advanceBy: (ms) => {
        currentTime += ms;
      },
    };
  }

  it('devuelve el valor almacenado antes de que expire', () => {
    const { cache } = setup();

    cache.set('products', [{ id: '1' }]);

    expect(cache.get('products')).toEqual([{ id: '1' }]);
    expect(cache.has('products')).toBe(true);
  });

  it('devuelve undefined para una clave que nunca se ha guardado', () => {
    const { cache } = setup();

    expect(cache.get('desconocida')).toBeUndefined();
    expect(cache.has('desconocida')).toBe(false);
  });

  it('mantiene la entrada válida hasta un instante antes de la hora', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'valor');
    advanceBy(ONE_HOUR_MS - 1);

    expect(cache.get('products')).toBe('valor');
  });

  it('expira la entrada exactamente al cumplirse la hora', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'valor');
    advanceBy(ONE_HOUR_MS);

    expect(cache.get('products')).toBeUndefined();
    expect(cache.has('products')).toBe(false);
  });

  it('expira la entrada pasada la hora', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'valor');
    advanceBy(ONE_HOUR_MS + 60_000);

    expect(cache.get('products')).toBeUndefined();
  });

  it('respeta el TTL con el que se escribió la entrada', () => {
    const { cache, advanceBy } = setup();

    cache.set('efimera', 'valor', 5_000);
    advanceBy(6_000);

    expect(cache.get('efimera')).toBeUndefined();
  });

  it('renueva la expiración al reescribir la clave', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'primero');
    advanceBy(ONE_HOUR_MS - 1_000);

    cache.set('products', 'segundo');
    advanceBy(ONE_HOUR_MS - 1_000);

    expect(cache.get('products')).toBe('segundo');
  });

  it('descarta entradas corruptas en lugar de propagar el error de parseo', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    storage.setItem('test:products', 'esto-no-es-json');

    expect(() => cache.get('products')).not.toThrow();
    expect(cache.get('products')).toBeUndefined();
    // La entrada inservible se elimina para que se revalide contra el API.
    expect(storage.getItem('test:products')).toBeNull();
  });

  it('descarta entradas sin marca de expiración', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    storage.setItem('test:products', JSON.stringify({ v: 'valor' }));

    expect(cache.get('products')).toBeUndefined();
  });

  it('elimina una clave concreta', () => {
    const { cache } = setup();

    cache.set('a', 1);
    cache.set('b', 2);
    cache.remove('a');

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
  });

  it('al limpiar solo borra las claves de su propio namespace', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    cache.set('a', 1);
    storage.setItem('otro-namespace:dato', 'intacto');

    cache.clear();

    expect(cache.get('a')).toBeUndefined();
    expect(storage.getItem('otro-namespace:dato')).toBe('intacto');
  });

  it('degrada a memoria si el almacenamiento no es utilizable', () => {
    const storage = createTestStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    // El sondeo inicial detecta que el storage no sirve y se sustituye por uno
    // en memoria, de modo que la caché sigue operativa durante la sesión.
    const cache = createCache({ namespace: 'test', storage });

    expect(cache.set('products', 'valor')).toBe(true);
    expect(cache.get('products')).toBe('valor');
  });

  it('no propaga el error si el almacenamiento se agota una vez en uso', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    // Falla después del sondeo: es el caso real de cuota agotada a mitad de
    // sesión, que el sondeo inicial no puede anticipar.
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => cache.set('products', 'valor')).not.toThrow();
    expect(cache.set('products', 'valor')).toBe(false);
    // Y la lectura simplemente no encuentra nada, forzando la revalidación.
    expect(cache.get('products')).toBeUndefined();
  });

  it('almacena valores falsy sin confundirlos con la ausencia de entrada', () => {
    const { cache } = setup();

    cache.set('cero', 0);
    cache.set('vacio', '');
    cache.set('nulo', null);

    expect(cache.get('cero')).toBe(0);
    expect(cache.get('vacio')).toBe('');
    expect(cache.get('nulo')).toBeNull();
    expect(cache.has('nulo')).toBe(true);
  });
});
