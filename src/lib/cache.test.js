import { describe, expect, it, vi } from 'vitest';
import { createCache, ONE_HOUR_MS } from './cache.js';
import { createTestStorage } from '../test/helpers.js';

/**
 * The one-hour expiry is an explicit requirement of the brief, so it is
 * verified with an injected clock rather than with real waits.
 */
describe('createCache', () => {
  /** Creates a cache with a controllable clock. */
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

  it('returns the stored value before it expires', () => {
    const { cache } = setup();

    cache.set('products', [{ id: '1' }]);

    expect(cache.get('products')).toEqual([{ id: '1' }]);
    expect(cache.has('products')).toBe(true);
  });

  it('returns undefined for a key that was never stored', () => {
    const { cache } = setup();

    expect(cache.get('desconocida')).toBeUndefined();
    expect(cache.has('desconocida')).toBe(false);
  });

  it('keeps the entry valid until an instant before the hour', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'valor');
    advanceBy(ONE_HOUR_MS - 1);

    expect(cache.get('products')).toBe('valor');
  });

  it('expires the entry exactly on the hour', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'valor');
    advanceBy(ONE_HOUR_MS);

    expect(cache.get('products')).toBeUndefined();
    expect(cache.has('products')).toBe(false);
  });

  it('expires the entry past the hour', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'valor');
    advanceBy(ONE_HOUR_MS + 60_000);

    expect(cache.get('products')).toBeUndefined();
  });

  it('honours the TTL the entry was written with', () => {
    const { cache, advanceBy } = setup();

    cache.set('efimera', 'valor', 5_000);
    advanceBy(6_000);

    expect(cache.get('efimera')).toBeUndefined();
  });

  it('renews the expiry when the key is rewritten', () => {
    const { cache, advanceBy } = setup();

    cache.set('products', 'primero');
    advanceBy(ONE_HOUR_MS - 1_000);

    cache.set('products', 'segundo');
    advanceBy(ONE_HOUR_MS - 1_000);

    expect(cache.get('products')).toBe('segundo');
  });

  it('discards corrupt entries instead of propagating the parse error', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    storage.setItem('test:products', 'esto-no-es-json');

    expect(() => cache.get('products')).not.toThrow();
    expect(cache.get('products')).toBeUndefined();
    // The unusable entry is removed so it gets revalidated against the API.
    expect(storage.getItem('test:products')).toBeNull();
  });

  it('discards entries without an expiry marker', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    storage.setItem('test:products', JSON.stringify({ v: 'valor' }));

    expect(cache.get('products')).toBeUndefined();
  });

  it('removes a specific key', () => {
    const { cache } = setup();

    cache.set('a', 1);
    cache.set('b', 2);
    cache.remove('a');

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
  });

  it('only clears the keys of its own namespace', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    cache.set('a', 1);
    storage.setItem('otro-namespace:dato', 'intacto');

    cache.clear();

    expect(cache.get('a')).toBeUndefined();
    expect(storage.getItem('otro-namespace:dato')).toBe('intacto');
  });

  it('degrades to memory if the storage is not usable', () => {
    const storage = createTestStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    // The initial probe detects the storage is no good and swaps it for an
    // in-memory one, so the cache stays operational for the session.
    const cache = createCache({ namespace: 'test', storage });

    expect(cache.set('products', 'valor')).toBe(true);
    expect(cache.get('products')).toBe('valor');
  });

  it('does not propagate the error if storage runs out once in use', () => {
    const storage = createTestStorage();
    const cache = createCache({ namespace: 'test', storage });

    // Fails after the probe: the real case of quota exhausted mid-session,
    // which the initial probe cannot anticipate.
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => cache.set('products', 'valor')).not.toThrow();
    expect(cache.set('products', 'valor')).toBe(false);
    // And the read simply finds nothing, forcing revalidation.
    expect(cache.get('products')).toBeUndefined();
  });

  it('stores falsy values without confusing them with a missing entry', () => {
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
