import { describe, expect, it } from 'vitest';
import { getPurchaseAvailability, UNAVAILABLE_REASON } from './availability.js';

/**
 * Builds a product with the three purchase conditions under control.
 *
 * The price is deliberately not resolved with a default parameter: that would
 * conflate "I did not specify it" with "I specified it as undefined", which is
 * precisely one of the cases that needs testing.
 *
 * @param {{ price?: unknown, storages?: unknown[], colors?: unknown[] }} [overrides]
 */
function buildProduct(overrides = {}) {
  const { storages = [{ code: 2000, name: '64 GB' }], colors = [{ code: 1000, name: 'Negro' }] } =
    overrides;

  const price = 'price' in overrides ? overrides.price : '699';

  return { id: 'abc', brand: 'Marca', model: 'Modelo', price, options: { colors, storages } };
}

describe('getPurchaseAvailability', () => {
  it('allows the purchase when there is a price, storage and colour', () => {
    const result = getPurchaseAvailability(buildProduct());

    expect(result.isAvailable).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.message).toBeNull();
  });

  it('treats a price of zero as valid: it is free, not missing', () => {
    expect(getPurchaseAvailability(buildProduct({ price: '0' })).isAvailable).toBe(true);
    expect(getPurchaseAvailability(buildProduct({ price: 0 })).isAvailable).toBe(true);
  });

  describe('a single reason', () => {
    it('blocks the purchase when there is no price', () => {
      const result = getPurchaseAvailability(buildProduct({ price: '' }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.PRICE]);
      expect(result.message).toBe(
        'Este producto no está disponible para la compra porque no tiene precio.'
      );
    });

    it('blocks the purchase when there is no storage', () => {
      const result = getPurchaseAvailability(buildProduct({ storages: [] }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.STORAGE]);
      expect(result.message).toContain('no tiene opciones de almacenamiento.');
    });

    it('blocks the purchase when there is no colour', () => {
      const result = getPurchaseAvailability(buildProduct({ colors: [] }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.COLOR]);
      expect(result.message).toContain('no tiene opciones de color.');
    });
  });

  describe('several reasons at once', () => {
    it('lists them all, instead of stopping at the first', () => {
      const result = getPurchaseAvailability(buildProduct({ price: '', colors: [] }));

      expect(result.reasons).toEqual([UNAVAILABLE_REASON.PRICE, UNAVAILABLE_REASON.COLOR]);
      expect(result.message).toBe(
        'Este producto no está disponible para la compra porque no tiene precio ni opciones de color.'
      );
    });

    it('lists all three with the correct Spanish punctuation', () => {
      const result = getPurchaseAvailability(buildProduct({ price: '', storages: [], colors: [] }));

      expect(result.message).toBe(
        'Este producto no está disponible para la compra porque no tiene precio, opciones de almacenamiento ni opciones de color.'
      );
    });
  });

  describe('ways in which the API omits data', () => {
    it('treats a non-numeric price as missing', () => {
      expect(getPurchaseAvailability(buildProduct({ price: 'consultar' })).isAvailable).toBe(false);
    });

    it('does not consider buyable a product whose price is only whitespace', () => {
      // Same pattern as options without a name: `Number(" ")` is 0, so without
      // trimming the product would pass as free and buyable.
      const result = getPurchaseAvailability(buildProduct({ price: ' ' }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.PRICE]);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['an empty string', ''],
    ])('treats a price of %s as missing', (_label, price) => {
      expect(getPurchaseAvailability(buildProduct({ price })).isAvailable).toBe(false);
    });

    it('treats missing options as a lack of storage and colour', () => {
      const result = getPurchaseAvailability({ id: 'abc', price: '699' });

      expect(result.reasons).toEqual([UNAVAILABLE_REASON.STORAGE, UNAVAILABLE_REASON.COLOR]);
    });

    it('discards options without a code, which could not be sent to the API', () => {
      const result = getPurchaseAvailability(
        buildProduct({ colors: [{ name: 'Negro sin código' }] })
      );

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.COLOR]);
    });

    it('does not consider buyable a product whose only option has no name', () => {
      // Real catalogue case: Acer DX650 and Acer M900 return a storage option
      // of `{ code: 2000, name: " " }`. Having a code is not enough: without a
      // name the user would not know what they are choosing.
      const result = getPurchaseAvailability(
        buildProduct({ storages: [{ code: 2000, name: ' ' }] })
      );

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.STORAGE]);
      expect(result.message).toContain('no tiene opciones de almacenamiento.');
    });
  });

  it('does not break while the product has not arrived yet', () => {
    const result = getPurchaseAvailability(null);

    expect(result.isAvailable).toBe(false);
    // With no product there is nothing to explain yet: the message only appears
    // once we know what it is missing.
    expect(result.message).toBeNull();
  });
});
