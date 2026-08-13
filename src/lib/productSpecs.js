import {
  formatPrice,
  formatSpecValue,
  formatSpecValueOrFallback,
  formatWeight,
  MISSING_VALUE,
} from './format.js';

/**
 * Translates the raw API detail into the specifications shown on the PDP.
 *
 * Two details of the API contract worth keeping in mind:
 *
 *   - There are typos in the field names (`dimentions`, `secondaryCmera`).
 *     They are respected when reading and corrected when displaying.
 *   - `displayResolution` actually holds the **size** in inches
 *     ("7.0 inches (~69.8%...)") and `displaySize` holds the **resolution** in
 *     pixels ("720 x 1280 pixels..."). They are swapped with respect to their
 *     names, so the label is assigned by actual content.
 */

/**
 * Specifications required by the brief.
 *
 * These rows are shown **always**, even without data: in that case the value is
 * `MISSING_VALUE`. Keeping the row lets you compare two spec sheets line by line
 * and makes clear that the attribute was looked up and the API does not provide
 * it, which is not the same as simply omitting it.
 *
 * This is the opposite criterion to `getAdditionalSpecGroups`, where a row
 * without data would only be noise.
 *
 * @param {object} product Product detail from the API.
 * @returns {Array<{ id: string, label: string, value: string }>}
 */
export function getRequiredSpecs(product) {
  if (!product) return [];

  // A product may carry only one of the two cameras: whichever exist are shown,
  // and the placeholder appears only if both are missing.
  const cameras = [formatSpecValue(product.primaryCamera), formatSpecValue(product.secondaryCmera)]
    .filter(Boolean)
    .join(' · ');

  return [
    { id: 'brand', label: 'Marca', value: formatSpecValueOrFallback(product.brand) },
    { id: 'model', label: 'Modelo', value: formatSpecValueOrFallback(product.model) },
    // The row is already labelled "Precio", so the placeholder is enough.
    {
      id: 'price',
      label: 'Precio',
      value: formatPrice(product.price, { fallback: MISSING_VALUE }),
    },
    { id: 'cpu', label: 'CPU', value: formatSpecValueOrFallback(product.cpu) },
    { id: 'ram', label: 'RAM', value: formatSpecValueOrFallback(product.ram) },
    { id: 'os', label: 'Sistema operativo', value: formatSpecValueOrFallback(product.os) },
    {
      id: 'displayResolution',
      label: 'Resolución de pantalla',
      // `displaySize` is the field carrying the pixels (see note above).
      value: formatSpecValueOrFallback(product.displaySize),
    },
    { id: 'battery', label: 'Batería', value: formatSpecValueOrFallback(product.battery) },
    { id: 'cameras', label: 'Cámaras', value: cameras || MISSING_VALUE },
    {
      id: 'dimentions',
      label: 'Dimensiones',
      value: formatSpecValueOrFallback(product.dimentions),
    },
    { id: 'weight', label: 'Peso', value: formatWeight(product.weight) },
  ];
}

/**
 * Complementary specifications, grouped by topic. The brief does not ask for
 * them; they enrich the page without cluttering the mandatory block.
 *
 * Unlike the mandatory ones, **a row without data is omitted entirely** instead
 * of showing a placeholder. If the API has no GPU, not even the "GPU" label
 * appears: here the gap would convey nothing and, multiplied by the twenty rows
 * of the block, would turn the page into a list of absences.
 *
 * A group left with no rows disappears too, so no orphan heading is left behind.
 *
 * @param {object} product Product detail from the API.
 * @returns {Array<{ id: string, title: string, specs: Array<{ id: string, label: string, value: string }> }>}
 */
export function getAdditionalSpecGroups(product) {
  if (!product) return [];

  /** @type {Array<{ id: string, title: string, fields: Array<[string, unknown]> }>} */
  const groups = [
    {
      id: 'display',
      title: 'Pantalla',
      fields: [
        ['Tipo', product.displayType],
        // `displayResolution` carries the inches (see note above).
        ['Tamaño', product.displayResolution],
      ],
    },
    {
      id: 'hardware',
      title: 'Hardware',
      fields: [
        ['Chipset', product.chipset],
        ['GPU', product.gpu],
        ['Memoria interna', product.internalMemory],
        ['Memoria externa', product.externalMemory],
      ],
    },
    {
      id: 'connectivity',
      title: 'Conectividad',
      fields: [
        ['Tecnología de red', product.networkTechnology],
        ['Velocidad', product.networkSpeed],
        ['SIM', product.sim],
        ['WLAN', product.wlan],
        ['Bluetooth', product.bluetooth],
        ['GPS', product.gps],
        ['NFC', product.nfc],
        ['USB', product.usb],
      ],
    },
    {
      id: 'misc',
      title: 'Otros',
      fields: [
        ['Sensores', product.sensors],
        ['Altavoz', product.speaker],
        ['Jack de audio', product.audioJack],
        ['Radio', product.radio],
        ['Anuncio', product.announced],
        ['Estado', product.status],
      ],
    },
  ];

  return groups
    .map(({ id, title, fields }) => ({
      id,
      title,
      specs: fields
        .map(([label, rawValue]) => ({
          id: `${id}-${label}`,
          label,
          value: formatSpecValue(rawValue),
        }))
        .filter((spec) => spec.value !== null),
    }))
    .filter((group) => group.specs.length > 0);
}

/**
 * Normalises the purchase options.
 *
 * The brief requires showing the selector even when there is a single option and
 * leaving it selected by default; always returning arrays means the component
 * does not have to distinguish cases.
 *
 * An option is only eligible if it meets **both** conditions:
 *
 *   - It has a `code`, because that is what `POST /api/cart` requires.
 *   - It has a name, because that is what the user reads to decide.
 *
 * The second is not theoretical: in the real catalogue there are products whose
 * only storage arrives as `{ code: 2000, name: " " }`. Keeping them painted a
 * pill with a dash — which nobody can meaningfully choose — and, by counting as
 * an option, left the product marked as buyable. Discarding them makes the
 * product correctly marked as unavailable.
 *
 * @param {object} product Product detail from the API.
 * @returns {{ colors: Array<{ code: number, name: string }>, storages: Array<{ code: number, name: string }> }}
 */
export function getPurchaseOptions(product) {
  const options = product?.options ?? {};

  const sanitize = (list) =>
    (Array.isArray(list) ? list : [])
      .filter((option) => option && option.code !== undefined && option.code !== null)
      .map((option) => ({ code: option.code, name: formatSpecValue(option.name) }))
      .filter((option) => option.name !== null);

  return {
    colors: sanitize(options.colors),
    storages: sanitize(options.storages),
  };
}
