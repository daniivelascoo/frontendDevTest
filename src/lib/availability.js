import { hasPrice } from './format.js';
import { getPurchaseOptions } from './productSpecs.js';

/**
 * Decides whether a product can be added to the cart, and if not, why.
 *
 * The real catalogue contains incomplete products. Adding one without a price
 * or without options is not a theoretical edge case: `POST /api/cart` requires
 * a `colorCode` and a `storageCode`, so without them the request cannot even be
 * built. And a product without a price cannot be sold even if the API accepted
 * the request.
 *
 * The logic lives here rather than in the component so the eight combinations
 * can be tested without mounting React.
 */

/** Reasons a product may be unavailable. */
export const UNAVAILABLE_REASON = {
  PRICE: 'price',
  STORAGE: 'storage',
  COLOR: 'color',
};

/** How each reason is named inside the sentence the user sees. */
const REASON_LABELS = {
  [UNAVAILABLE_REASON.PRICE]: 'precio',
  [UNAVAILABLE_REASON.STORAGE]: 'opciones de almacenamiento',
  [UNAVAILABLE_REASON.COLOR]: 'opciones de color',
};

/**
 * Joins the labels with "ni", the conjunction Spanish requires in a negative
 * sentence: "no tiene precio, opciones de almacenamiento ni opciones de color".
 *
 * @param {string[]} labels
 * @returns {string}
 */
function joinNegative(labels) {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];

  return `${labels.slice(0, -1).join(', ')} ni ${labels[labels.length - 1]}`;
}

/**
 * @typedef {object} PurchaseAvailability
 * @property {boolean} isAvailable Whether the product can be added to the cart.
 * @property {string[]} reasons Reasons for unavailability (`UNAVAILABLE_REASON`).
 * @property {string | null} message Explanation for the user, or `null` when available.
 */

/**
 * @param {object | null | undefined} product Product detail from the API.
 * @returns {PurchaseAvailability}
 */
export function getPurchaseAvailability(product) {
  if (!product) {
    return { isAvailable: false, reasons: [], message: null };
  }

  const { colors, storages } = getPurchaseOptions(product);

  const reasons = [];
  if (!hasPrice(product.price)) reasons.push(UNAVAILABLE_REASON.PRICE);
  if (storages.length === 0) reasons.push(UNAVAILABLE_REASON.STORAGE);
  if (colors.length === 0) reasons.push(UNAVAILABLE_REASON.COLOR);

  if (reasons.length === 0) {
    return { isAvailable: true, reasons: [], message: null };
  }

  // Every reason is named, not just the first: telling the user the price is
  // missing and then, once that is solved, that the colours are missing makes
  // the explanation look like it keeps changing its excuse.
  const labels = reasons.map((reason) => REASON_LABELS[reason]);

  return {
    isAvailable: false,
    reasons,
    message: `Este producto no está disponible para la compra porque no tiene ${joinNegative(labels)}.`,
  };
}
