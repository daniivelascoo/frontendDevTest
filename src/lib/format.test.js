import { describe, expect, it } from 'vitest';
import {
  formatPrice,
  formatProductName,
  formatSpecValue,
  formatSpecValueOrFallback,
  formatWeight,
  hasPrice,
  MISSING_VALUE,
} from './format.js';

describe('hasPrice', () => {
  it('acepta los precios reales, incluido el cero', () => {
    expect(hasPrice('699')).toBe(true);
    expect(hasPrice(699)).toBe(true);
    // Gratis no es lo mismo que sin precio.
    expect(hasPrice('0')).toBe(true);
    expect(hasPrice(0)).toBe(true);
  });

  it.each([
    ['cadena vacía', ''],
    ['un espacio', ' '],
    ['varios espacios', '   '],
    ['tabulador y salto', '\t\n'],
    ['null', null],
    ['undefined', undefined],
    ['texto no numérico', 'consultar'],
  ])('rechaza %s', (_label, value) => {
    expect(hasPrice(value)).toBe(false);
  });
});

describe('formatPrice', () => {
  it('formatea un precio numérico en euros', () => {
    // El separador de miles del locale es un espacio no separable.
    expect(formatPrice('699')).toMatch(/699/);
    expect(formatPrice('699')).toContain('€');
  });

  it('acepta tanto cadena como número', () => {
    expect(formatPrice(170)).toBe(formatPrice('170'));
  });

  it('distingue un producto sin precio de uno que cuesta cero', () => {
    expect(formatPrice('')).toBe('Precio no disponible');
    expect(formatPrice(null)).toBe('Precio no disponible');
    expect(formatPrice(undefined)).toBe('Precio no disponible');
    expect(formatPrice(0)).toContain('0');
  });

  it('no intenta formatear valores que no son numéricos', () => {
    expect(formatPrice('consultar')).toBe('Precio no disponible');
  });

  it('no confunde un precio de solo espacios con un producto gratuito', () => {
    // `Number(" ")` es 0, no NaN: sin recortar antes, un precio en blanco se
    // mostraría como «0 €» y el producto se podría comprar.
    expect(formatPrice(' ')).toBe('Precio no disponible');
    expect(formatPrice('   ')).toBe('Precio no disponible');
    expect(formatPrice('\t\n')).toBe('Precio no disponible');
  });

  it('acepta un precio con espacios alrededor de un número real', () => {
    expect(formatPrice(' 699 ')).toContain('699');
  });

  it('acepta un marcador alternativo para la ficha técnica', () => {
    // En la fila etiquetada "Precio" basta con el guion.
    expect(formatPrice('', { fallback: MISSING_VALUE })).toBe('-');
    expect(formatPrice(null, { fallback: MISSING_VALUE })).toBe('-');
    // Con precio, el marcador es irrelevante.
    expect(formatPrice('699', { fallback: MISSING_VALUE })).toContain('699');
  });
});

describe('formatSpecValue', () => {
  it('une los arrays con comas', () => {
    expect(formatSpecValue(['13 MP', 'autofocus'])).toBe('13 MP, autofocus');
  });

  it('descarta los elementos vacíos de un array', () => {
    expect(formatSpecValue(['13 MP', '', '  '])).toBe('13 MP');
  });

  it('devuelve null cuando no hay dato útil', () => {
    expect(formatSpecValue('')).toBeNull();
    expect(formatSpecValue('   ')).toBeNull();
    expect(formatSpecValue([])).toBeNull();
    expect(formatSpecValue(null)).toBeNull();
    expect(formatSpecValue(undefined)).toBeNull();
  });

  it('recorta los espacios de las cadenas', () => {
    expect(formatSpecValue('  Android 6.0  ')).toBe('Android 6.0');
  });
});

describe('formatSpecValueOrFallback', () => {
  it('sustituye la ausencia de dato por el marcador', () => {
    expect(formatSpecValueOrFallback('')).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback('   ')).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback([])).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback(null)).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback(undefined)).toBe(MISSING_VALUE);
  });

  it('devuelve el dato cuando existe', () => {
    expect(formatSpecValueOrFallback('2 GB RAM')).toBe('2 GB RAM');
  });
});

describe('formatWeight', () => {
  it('añade la unidad al peso, que el API entrega sin ella', () => {
    expect(formatWeight('260')).toBe('260 g');
  });

  it('respeta el valor si ya trae unidad', () => {
    expect(formatWeight('260 g')).toBe('260 g');
  });

  it('devuelve el marcador cuando no hay peso', () => {
    expect(formatWeight('')).toBe(MISSING_VALUE);
    expect(formatWeight(null)).toBe(MISSING_VALUE);
  });
});

describe('formatProductName', () => {
  it('combina marca y modelo', () => {
    expect(formatProductName({ brand: 'Acer', model: 'Iconia Talk S' })).toBe('Acer Iconia Talk S');
  });

  it('omite las partes que faltan', () => {
    expect(formatProductName({ brand: 'Acer' })).toBe('Acer');
    expect(formatProductName({})).toBe('');
    expect(formatProductName(null)).toBe('');
  });
});
