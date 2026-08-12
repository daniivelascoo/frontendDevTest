/**
 * Filtrado del catálogo.
 *
 * La prueba pide comparar el criterio de búsqueda con la **marca** y el
 * **modelo**. Sobre ese mínimo, la implementación añade dos cosas que el
 * usuario espera de cualquier buscador:
 *
 *   - Insensibilidad a mayúsculas y a acentos: "Xiaomi Mí" encuentra "Mi".
 *   - Coincidencia por palabras sueltas y en cualquier orden: "s9 samsung"
 *     encuentra "Samsung Galaxy S9".
 */

/**
 * Marcas diacríticas combinables que `normalize('NFD')` separa de su letra
 * base (U+0300–U+036F). Se define con escapes Unicode y no con los caracteres
 * literales, que son invisibles en el editor y fáciles de romper.
 */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/**
 * Pasa un texto a minúsculas y le retira los diacríticos.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeText(value) {
  if (value === null || value === undefined) return '';

  return String(value).normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();
}

/**
 * Divide la consulta del usuario en términos independientes.
 *
 * @param {string} query
 * @returns {string[]}
 */
export function tokenizeQuery(query) {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/**
 * Comprueba si un producto satisface la consulta.
 *
 * @param {{ brand?: string, model?: string }} product
 * @param {string[]} tokens Consulta ya tokenizada y normalizada.
 * @returns {boolean}
 */
export function matchesTokens(product, tokens) {
  if (tokens.length === 0) return true;

  const haystack = normalizeText(`${product?.brand ?? ''} ${product?.model ?? ''}`);
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Filtra el catálogo por marca y modelo.
 *
 * @param {Array<{ brand?: string, model?: string }>} products
 * @param {string} query
 * @returns {Array<{ brand?: string, model?: string }>} El mismo array cuando la
 *   consulta está vacía, para evitar recrear referencias sin necesidad.
 */
export function filterProducts(products, query) {
  if (!Array.isArray(products)) return [];

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return products;

  return products.filter((product) => matchesTokens(product, tokens));
}
