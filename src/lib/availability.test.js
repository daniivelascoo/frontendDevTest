import { describe, expect, it } from 'vitest';
import { getPurchaseAvailability, UNAVAILABLE_REASON } from './availability.js';

/**
 * Construye un producto con las tres condiciones de compra bajo control.
 *
 * El precio no se resuelve con un parámetro por defecto a propósito: eso
 * confundiría «no lo he indicado» con «lo he indicado como undefined», que es
 * justo uno de los casos que hay que probar.
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
  it('permite la compra cuando hay precio, almacenamiento y color', () => {
    const result = getPurchaseAvailability(buildProduct());

    expect(result.isAvailable).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.message).toBeNull();
  });

  it('considera válido un precio de cero: es gratis, no inexistente', () => {
    expect(getPurchaseAvailability(buildProduct({ price: '0' })).isAvailable).toBe(true);
    expect(getPurchaseAvailability(buildProduct({ price: 0 })).isAvailable).toBe(true);
  });

  describe('un solo motivo', () => {
    it('bloquea la compra si no hay precio', () => {
      const result = getPurchaseAvailability(buildProduct({ price: '' }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.PRICE]);
      expect(result.message).toBe(
        'Este producto no está disponible para la compra porque no tiene precio.'
      );
    });

    it('bloquea la compra si no hay almacenamiento', () => {
      const result = getPurchaseAvailability(buildProduct({ storages: [] }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.STORAGE]);
      expect(result.message).toContain('no tiene opciones de almacenamiento.');
    });

    it('bloquea la compra si no hay color', () => {
      const result = getPurchaseAvailability(buildProduct({ colors: [] }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.COLOR]);
      expect(result.message).toContain('no tiene opciones de color.');
    });
  });

  describe('varios motivos a la vez', () => {
    it('los enumera todos, en lugar de quedarse en el primero', () => {
      const result = getPurchaseAvailability(buildProduct({ price: '', colors: [] }));

      expect(result.reasons).toEqual([UNAVAILABLE_REASON.PRICE, UNAVAILABLE_REASON.COLOR]);
      expect(result.message).toBe(
        'Este producto no está disponible para la compra porque no tiene precio ni opciones de color.'
      );
    });

    it('enumera los tres con la puntuación correcta en castellano', () => {
      const result = getPurchaseAvailability(buildProduct({ price: '', storages: [], colors: [] }));

      expect(result.message).toBe(
        'Este producto no está disponible para la compra porque no tiene precio, opciones de almacenamiento ni opciones de color.'
      );
    });
  });

  describe('formas en que el API omite los datos', () => {
    it('trata un precio no numérico como ausente', () => {
      expect(getPurchaseAvailability(buildProduct({ price: 'consultar' })).isAvailable).toBe(false);
    });

    it('no da por comprable un producto cuyo precio son solo espacios', () => {
      // Mismo patrón que las opciones sin nombre: `Number(" ")` es 0, así que
      // sin recortar el producto pasaría por gratuito y comprable.
      const result = getPurchaseAvailability(buildProduct({ price: ' ' }));

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.PRICE]);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['cadena vacía', ''],
    ])('trata un precio %s como ausente', (_label, price) => {
      expect(getPurchaseAvailability(buildProduct({ price })).isAvailable).toBe(false);
    });

    it('trata unas opciones ausentes como falta de almacenamiento y color', () => {
      const result = getPurchaseAvailability({ id: 'abc', price: '699' });

      expect(result.reasons).toEqual([UNAVAILABLE_REASON.STORAGE, UNAVAILABLE_REASON.COLOR]);
    });

    it('descarta las opciones sin código, que no se podrían enviar al API', () => {
      const result = getPurchaseAvailability(
        buildProduct({ colors: [{ name: 'Negro sin código' }] })
      );

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.COLOR]);
    });

    it('no da por comprable un producto cuya única opción no tiene nombre', () => {
      // Caso real del catálogo: Acer DX650 y Acer M900 devuelven un
      // almacenamiento `{ code: 2000, name: " " }`. Tener código no basta:
      // sin nombre el usuario no sabría qué está eligiendo.
      const result = getPurchaseAvailability(
        buildProduct({ storages: [{ code: 2000, name: ' ' }] })
      );

      expect(result.isAvailable).toBe(false);
      expect(result.reasons).toEqual([UNAVAILABLE_REASON.STORAGE]);
      expect(result.message).toContain('no tiene opciones de almacenamiento.');
    });
  });

  it('no falla mientras el producto aún no ha llegado', () => {
    const result = getPurchaseAvailability(null);

    expect(result.isAvailable).toBe(false);
    // Sin producto no hay nada que explicar todavía: el mensaje solo aparece
    // cuando se sabe qué le falta.
    expect(result.message).toBeNull();
  });
});
