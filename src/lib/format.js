/**
 * Utilidades de formato para los datos que devuelve el API.
 *
 * El API entrega los valores como cadenas heterogéneas (y en ocasiones
 * vacías, o como arrays). Estas funciones concentran esa normalización para
 * que los componentes se limiten a pintar.
 */

const priceFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Marcador de dato ausente.
 *
 * Se reserva para los datos **obligatorios**, que ocupan su fila siempre para
 * que las fichas de dos productos se puedan comparar línea a línea. Los datos
 * secundarios no usan este marcador: directamente no se muestran.
 */
export const MISSING_VALUE = '-';

/**
 * Indica si un producto tiene precio.
 *
 * Algunos productos del catálogo llegan con `price: ""`, que significa "no
 * está a la venta" y no "cuesta 0 €". Es la regla que decide tanto qué se
 * pinta como si el producto se puede comprar, así que vive en un solo sitio:
 * `formatPrice` y la comprobación de disponibilidad la comparten.
 *
 * Un precio de 0 sí cuenta como precio válido: es gratis, no es inexistente.
 *
 * @param {string | number | null | undefined} price
 * @returns {boolean}
 */
export function hasPrice(price) {
  if (price === null || price === undefined || price === '') return false;

  return Number.isFinite(Number(price));
}

/**
 * Formatea un precio como moneda europea.
 *
 * @param {string | number | null | undefined} price
 * @param {object} [options]
 * @param {string} [options.fallback] Qué devolver si no hay precio. Por defecto
 *   un texto explicativo, porque el precio suele mostrarse suelto (tarjeta,
 *   bloque de compra) y ahí un guion no diría nada. En la ficha técnica, donde
 *   la fila ya está etiquetada como "Precio", se pasa `MISSING_VALUE`.
 * @returns {string}
 */
export function formatPrice(price, { fallback = 'Precio no disponible' } = {}) {
  if (!hasPrice(price)) return fallback;

  return priceFormatter.format(Number(price));
}

/**
 * Normaliza cualquier valor de especificación a un texto presentable.
 *
 * El API mezcla cadenas y arrays (`primaryCamera` puede ser
 * `"13 MP"` o `["13 MP", "autofocus"]`).
 *
 * @param {unknown} value
 * @returns {string | null} El texto, o `null` si no hay dato útil.
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
 * Igual que `formatSpecValue`, pero devuelve el marcador de dato ausente en
 * lugar de `null`. Solo para los campos obligatorios, que siempre ocupan fila.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function formatSpecValueOrFallback(value) {
  return formatSpecValue(value) ?? MISSING_VALUE;
}

/**
 * Formatea el peso, que el API entrega como número de gramos sin unidad.
 *
 * @param {unknown} weight
 * @returns {string}
 */
export function formatWeight(weight) {
  const text = formatSpecValue(weight);
  if (!text) return MISSING_VALUE;

  // Si ya trae unidad, se respeta tal cual.
  if (/[a-z]/i.test(text)) return text;

  const grams = Number(text);
  return Number.isFinite(grams) ? `${grams} g` : text;
}

/**
 * Nombre completo del producto, tal y como se usa en títulos y breadcrumbs.
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
