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
 * Formatea un precio como moneda europea.
 *
 * Algunos productos del catálogo llegan con `price: ""`, que significa
 * "no está a la venta" y no "cuesta 0 €".
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
  if (price === null || price === undefined || price === '') return fallback;

  const amount = Number(price);
  if (!Number.isFinite(amount)) return fallback;

  return priceFormatter.format(amount);
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
