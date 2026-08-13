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
  it('accepts real prices, zero included', () => {
    expect(hasPrice('699')).toBe(true);
    expect(hasPrice(699)).toBe(true);
    // Free is not the same as priceless.
    expect(hasPrice('0')).toBe(true);
    expect(hasPrice(0)).toBe(true);
  });

  it.each([
    ['an empty string', ''],
    ['a single space', ' '],
    ['several spaces', '   '],
    ['tab and newline', '\t\n'],
    ['null', null],
    ['undefined', undefined],
    ['non-numeric text', 'consultar'],
  ])('rejects %s', (_label, value) => {
    expect(hasPrice(value)).toBe(false);
  });
});

describe('formatPrice', () => {
  it('formats a numeric price in euros', () => {
    // The locale's thousands separator is a non-breaking space.
    expect(formatPrice('699')).toMatch(/699/);
    expect(formatPrice('699')).toContain('€');
  });

  it('accepts both a string and a number', () => {
    expect(formatPrice(170)).toBe(formatPrice('170'));
  });

  it('distinguishes a product without a price from one costing zero', () => {
    expect(formatPrice('')).toBe('Precio no disponible');
    expect(formatPrice(null)).toBe('Precio no disponible');
    expect(formatPrice(undefined)).toBe('Precio no disponible');
    expect(formatPrice(0)).toContain('0');
  });

  it('does not try to format non-numeric values', () => {
    expect(formatPrice('consultar')).toBe('Precio no disponible');
  });

  it('does not mistake a whitespace-only price for a free product', () => {
    // `Number(" ")` is 0, not NaN: without trimming first, a blank price would
    // be displayed as "0 €" and the product would be buyable.
    expect(formatPrice(' ')).toBe('Precio no disponible');
    expect(formatPrice('   ')).toBe('Precio no disponible');
    expect(formatPrice('\t\n')).toBe('Precio no disponible');
  });

  it('accepts a price with whitespace around a real number', () => {
    expect(formatPrice(' 699 ')).toContain('699');
  });

  it('accepts an alternative placeholder for the spec sheet', () => {
    // In the row labelled "Precio" the dash is enough.
    expect(formatPrice('', { fallback: MISSING_VALUE })).toBe('-');
    expect(formatPrice(null, { fallback: MISSING_VALUE })).toBe('-');
    // With a price, the placeholder is irrelevant.
    expect(formatPrice('699', { fallback: MISSING_VALUE })).toContain('699');
  });
});

describe('formatSpecValue', () => {
  it('joins arrays with commas', () => {
    expect(formatSpecValue(['13 MP', 'autofocus'])).toBe('13 MP, autofocus');
  });

  it('discards the empty items of an array', () => {
    expect(formatSpecValue(['13 MP', '', '  '])).toBe('13 MP');
  });

  it('returns null when there is no useful data', () => {
    expect(formatSpecValue('')).toBeNull();
    expect(formatSpecValue('   ')).toBeNull();
    expect(formatSpecValue([])).toBeNull();
    expect(formatSpecValue(null)).toBeNull();
    expect(formatSpecValue(undefined)).toBeNull();
  });

  it('trims whitespace from strings', () => {
    expect(formatSpecValue('  Android 6.0  ')).toBe('Android 6.0');
  });
});

describe('formatSpecValueOrFallback', () => {
  it('replaces missing data with the placeholder', () => {
    expect(formatSpecValueOrFallback('')).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback('   ')).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback([])).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback(null)).toBe(MISSING_VALUE);
    expect(formatSpecValueOrFallback(undefined)).toBe(MISSING_VALUE);
  });

  it('returns the data when it exists', () => {
    expect(formatSpecValueOrFallback('2 GB RAM')).toBe('2 GB RAM');
  });
});

describe('formatWeight', () => {
  it('adds the unit to the weight, which the API delivers without one', () => {
    expect(formatWeight('260')).toBe('260 g');
  });

  it('leaves the value alone if it already carries a unit', () => {
    expect(formatWeight('260 g')).toBe('260 g');
  });

  it('returns the placeholder when there is no weight', () => {
    expect(formatWeight('')).toBe(MISSING_VALUE);
    expect(formatWeight(null)).toBe(MISSING_VALUE);
  });
});

describe('formatProductName', () => {
  it('combines brand and model', () => {
    expect(formatProductName({ brand: 'Acer', model: 'Iconia Talk S' })).toBe('Acer Iconia Talk S');
  });

  it('omits the missing parts', () => {
    expect(formatProductName({ brand: 'Acer' })).toBe('Acer');
    expect(formatProductName({})).toBe('');
    expect(formatProductName(null)).toBe('');
  });
});
