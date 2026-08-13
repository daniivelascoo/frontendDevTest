/**
 * Formatting helpers for the data returned by the API.
 *
 * The API delivers values as heterogeneous strings (sometimes empty, sometimes
 * arrays). These functions concentrate that normalisation so components only
 * have to paint.
 */

const priceFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Placeholder for missing data.
 *
 * Reserved for **mandatory** values, which always occupy their row so that two
 * products' spec sheets can be compared line by line. Secondary values do not
 * use this placeholder: they are simply not shown.
 */
export const MISSING_VALUE = '-';

/**
 * Tells whether a product has a price.
 *
 * Some catalogue products arrive with `price: ""`, which means "not for sale"
 * and not "costs 0 €". This is the rule deciding both what gets painted and
 * whether the product can be bought, so it lives in a single place:
 * `formatPrice` and the availability check share it.
 *
 * A price of 0 does count as a valid price: it is free, not missing.
 *
 * @param {string | number | null | undefined} price
 * @returns {boolean}
 */
export function hasPrice(price) {
  if (price === null || price === undefined) return false;

  // Trim before converting: `Number(" ")` is 0, not NaN, so a whitespace-only
  // price would slip through as a free, buyable product.
  const text = String(price).trim();
  if (text === '') return false;

  return Number.isFinite(Number(text));
}

/**
 * Formats a price as European currency.
 *
 * @param {string | number | null | undefined} price
 * @param {object} [options]
 * @param {string} [options.fallback] What to return when there is no price.
 *   Defaults to an explanatory text, because the price is usually shown on its
 *   own (card, purchase block) where a dash would say nothing. In the spec
 *   sheet, where the row is already labelled "Precio", `MISSING_VALUE` is passed.
 * @returns {string}
 */
export function formatPrice(price, { fallback = 'Precio no disponible' } = {}) {
  if (!hasPrice(price)) return fallback;

  return priceFormatter.format(Number(String(price).trim()));
}

/**
 * Normalises any specification value into presentable text.
 *
 * The API mixes strings and arrays (`primaryCamera` can be `"13 MP"` or
 * `["13 MP", "autofocus"]`).
 *
 * @param {unknown} value
 * @returns {string | null} The text, or `null` if there is no useful data.
 */
export function formatSpecValue(value) {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    const parts = value.map((item) => String(item).trim()).filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

/**
 * Same as `formatSpecValue`, but returns the missing-data placeholder instead
 * of `null`. Only for mandatory fields, which always occupy a row.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function formatSpecValueOrFallback(value) {
  return formatSpecValue(value) ?? MISSING_VALUE;
}

/**
 * Formats the weight, which the API delivers as a number of grams with no unit.
 *
 * @param {unknown} weight
 * @returns {string}
 */
export function formatWeight(weight) {
  const text = formatSpecValue(weight);
  if (!text) return MISSING_VALUE;

  // If it already carries a unit, leave it as it is.
  if (/[a-z]/i.test(text)) return text;

  const grams = Number(text);
  return Number.isFinite(grams) ? `${grams} g` : text;
}

/**
 * Full product name, as used in titles and breadcrumbs.
 *
 * @param {{ brand?: string, model?: string } | null | undefined} product
 * @returns {string}
 */
export function formatProductName(product) {
  if (!product) return '';
  return [product.brand, product.model]
    .map((part) => (part ?? '').toString().trim())
    .filter(Boolean)
    .join(' ');
}
