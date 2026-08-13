import { describe, expect, it } from 'vitest';
import { filterProducts, normalizeText, tokenizeQuery } from './search.js';
import { productListFixture } from '../test/fixtures.js';

describe('normalizeText', () => {
  it('lowercases the text and strips accents', () => {
    expect(normalizeText('Xiaomi Mí ÁÉÍÓÚ')).toBe('xiaomi mi aeiou');
  });

  it('tolerates missing values', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});

describe('tokenizeQuery', () => {
  it('splits the query into terms and discards surplus whitespace', () => {
    expect(tokenizeQuery('  samsung   galaxy ')).toEqual(['samsung', 'galaxy']);
  });

  it('returns an empty list for a blank query', () => {
    expect(tokenizeQuery('   ')).toEqual([]);
  });
});

describe('filterProducts', () => {
  it('returns the whole catalogue when there is no search term', () => {
    expect(filterProducts(productListFixture, '')).toBe(productListFixture);
    expect(filterProducts(productListFixture, '   ')).toBe(productListFixture);
  });

  it('filters by brand', () => {
    const result = filterProducts(productListFixture, 'samsung');

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe('Galaxy S9');
  });

  it('filters by model', () => {
    const result = filterProducts(productListFixture, 'redmi');

    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('Xiaomi');
  });

  it('ignores case', () => {
    expect(filterProducts(productListFixture, 'ACER')).toHaveLength(1);
    expect(filterProducts(productListFixture, 'acer')).toHaveLength(1);
  });

  it('finds the product with the terms in any order', () => {
    const result = filterProducts(productListFixture, 's9 samsung');

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe('Galaxy S9');
  });

  it('requires every term to match', () => {
    expect(filterProducts(productListFixture, 'samsung redmi')).toHaveLength(0);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterProducts(productListFixture, 'nokia')).toEqual([]);
  });

  it('does not break if the catalogue has not arrived yet', () => {
    expect(filterProducts(undefined, 'acer')).toEqual([]);
    expect(filterProducts(null, 'acer')).toEqual([]);
  });
});
