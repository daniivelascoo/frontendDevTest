import { hasPrice } from './format.js';
import { getPurchaseOptions } from './productSpecs.js';

/**
 * Decide si un producto se puede añadir a la cesta, y si no, por qué.
 *
 * El catálogo real contiene productos incompletos. Añadir uno sin precio o sin
 * opciones no es un caso límite teórico: el `POST /api/cart` exige un
 * `colorCode` y un `storageCode`, así que sin ellos la petición no se puede
 * ni construir. Y un producto sin precio no se puede vender aunque el API
 * aceptase la petición.
 *
 * La lógica vive aquí y no en el componente para poder probar las ocho
 * combinaciones sin montar React.
 */

/** Motivos por los que un producto puede no estar disponible. */
export const UNAVAILABLE_REASON = {
  PRICE: 'price',
  STORAGE: 'storage',
  COLOR: 'color',
};

/** Cómo se nombra cada motivo dentro de la frase que ve el usuario. */
const REASON_LABELS = {
  [UNAVAILABLE_REASON.PRICE]: 'precio',
  [UNAVAILABLE_REASON.STORAGE]: 'opciones de almacenamiento',
  [UNAVAILABLE_REASON.COLOR]: 'opciones de color',
};

/**
 * Enumera en castellano con «ni», que es la conjunción que corresponde en una
 * frase negativa: "no tiene precio, opciones de almacenamiento ni opciones de
 * color".
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
 * @property {boolean} isAvailable Si el producto se puede añadir a la cesta.
 * @property {string[]} reasons Motivos de la indisponibilidad (`UNAVAILABLE_REASON`).
 * @property {string | null} message Explicación para el usuario, o `null` si está disponible.
 */

/**
 * @param {object | null | undefined} product Detalle de producto del API.
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

  // Se nombran todos los motivos, no solo el primero: si al usuario le dices
  // que falta el precio y luego, resuelto eso, que faltan los colores, la
  // explicación parece que va cambiando de excusa.
  const labels = reasons.map((reason) => REASON_LABELS[reason]);

  return {
    isAvailable: false,
    reasons,
    message: `Este producto no está disponible para la compra porque no tiene ${joinNegative(labels)}.`,
  };
}
