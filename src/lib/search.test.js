import { describe, expect, it } from 'vitest';
import { filterProducts, normalizeText, tokenizeQuery } from './search.js';
import { productListFixture } from '../test/fixtures.js';

describe('normalizeText', () => {
  it('pasa a minúsculas y retira los acentos', () => {
    expect(normalizeText('Xiaomi Mí ÁÉÍÓÚ')).toBe('xiaomi mi aeiou');
  });

  it('tolera valores ausentes', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});

describe('tokenizeQuery', () => {
  it('separa la consulta en términos y descarta los espacios sobrantes', () => {
    expect(tokenizeQuery('  samsung   galaxy ')).toEqual(['samsung', 'galaxy']);
  });

  it('devuelve una lista vacía para una consulta en blanco', () => {
    expect(tokenizeQuery('   ')).toEqual([]);
  });
});

describe('filterProducts', () => {
  it('devuelve el catálogo completo cuando no hay criterio', () => {
    expect(filterProducts(productListFixture, '')).toBe(productListFixture);
    expect(filterProducts(productListFixture, '   ')).toBe(productListFixture);
  });

  it('filtra por marca', () => {
    const result = filterProducts(productListFixture, 'samsung');

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe('Galaxy S9');
  });

  it('filtra por modelo', () => {
    const result = filterProducts(productListFixture, 'redmi');

    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('Xiaomi');
  });

  it('ignora mayúsculas y minúsculas', () => {
    expect(filterProducts(productListFixture, 'ACER')).toHaveLength(1);
    expect(filterProducts(productListFixture, 'acer')).toHaveLength(1);
  });

  it('encuentra el producto con los términos en cualquier orden', () => {
    const result = filterProducts(productListFixture, 's9 samsung');

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe('Galaxy S9');
  });

  it('exige que se cumplan todos los términos', () => {
    expect(filterProducts(productListFixture, 'samsung redmi')).toHaveLength(0);
  });

  it('devuelve una lista vacía cuando nada coincide', () => {
    expect(filterProducts(productListFixture, 'nokia')).toEqual([]);
  });

  it('no falla si el catálogo aún no ha llegado', () => {
    expect(filterProducts(undefined, 'acer')).toEqual([]);
    expect(filterProducts(null, 'acer')).toEqual([]);
  });
});
