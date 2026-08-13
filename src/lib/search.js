/**
 * Catalogue filtering.
 *
 * The brief asks for the search term to be compared against **brand** and
 * **model**. On top of that minimum, the implementation adds two things users
 * expect from any search box:
 *
 *   - Case and accent insensitivity: "Xiaomi Mí" finds "Mi".
 *   - Matching on individual words in any order: "s9 samsung" finds
 *     "Samsung Galaxy S9".
 */

/**
 * Combining diacritical marks that `normalize('NFD')` separates from their base
 * letter (U+0300–U+036F). Defined with Unicode escapes rather than the literal
 * characters, which are invisible in an editor and easy to break.
 */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/**
 * Lowercases a text and strips its diacritics.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeText(value) {
  if (value === null || value === undefined) return '';

  return String(value).normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();
}

/**
 * Splits the user's query into independent terms.
 *
 * @param {string} query
 * @returns {string[]}
 */
export function tokenizeQuery(query) {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/**
 * Checks whether a product satisfies the query.
 *
 * @param {{ brand?: string, model?: string }} product
 * @param {string[]} tokens Query already tokenised and normalised.
 * @returns {boolean}
 */
export function matchesTokens(product, tokens) {
  if (tokens.length === 0) return true;

  const haystack = normalizeText(`${product?.brand ?? ''} ${product?.model ?? ''}`);
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Filters the catalogue by brand and model.
 *
 * @param {Array<{ brand?: string, model?: string }>} products
 * @param {string} query
 * @returns {Array<{ brand?: string, model?: string }>} The same array when the
 *   query is empty, to avoid recreating references for nothing.
 */
export function filterProducts(products, query) {
  if (!Array.isArray(products)) return [];

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return products;

  return products.filter((product) => matchesTokens(product, tokens));
}
