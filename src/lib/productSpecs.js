import {
  formatPrice,
  formatSpecValue,
  formatSpecValueOrFallback,
  formatWeight,
  MISSING_VALUE,
} from './format.js';

/**
 * Traduce el detalle crudo del API a las especificaciones que muestra la PDP.
 *
 * Dos detalles del contrato del API que conviene tener presentes:
 *
 *   - Hay erratas en los nombres de campo (`dimentions`, `secondaryCmera`).
 *     Se respetan al leer y se corrigen al mostrar.
 *   - `displayResolution` contiene en realidad el **tamaño** en pulgadas
 *     ("7.0 inches (~69.8%...)") y `displaySize` contiene la **resolución** en
 *     píxeles ("720 x 1280 pixels..."). Están intercambiados respecto a su
 *     nombre, así que la etiqueta se asigna según el contenido real.
 */

/**
 * Especificaciones exigidas por el enunciado.
 *
 * Estas filas se muestran **siempre**, incluso sin dato: en ese caso el valor
 * es `MISSING_VALUE`. Mantener la fila permite comparar dos fichas línea a
 * línea y deja claro que el atributo se ha consultado y el API no lo aporta,
 * que no es lo mismo que omitirlo sin más.
 *
 * Es el criterio opuesto al de `getAdditionalSpecGroups`, donde una fila sin
 * dato solo sería ruido.
 *
 * @param {object} product Detalle de producto del API.
 * @returns {Array<{ id: string, label: string, value: string }>}
 */
export function getRequiredSpecs(product) {
  if (!product) return [];

  // Un producto puede traer solo una de las dos cámaras: se muestran las que
  // haya, y el marcador únicamente si faltan ambas.
  const cameras = [formatSpecValue(product.primaryCamera), formatSpecValue(product.secondaryCmera)]
    .filter(Boolean)
    .join(' · ');

  return [
    { id: 'brand', label: 'Marca', value: formatSpecValueOrFallback(product.brand) },
    { id: 'model', label: 'Modelo', value: formatSpecValueOrFallback(product.model) },
    // La fila ya está etiquetada como "Precio", así que basta con el marcador.
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
      // `displaySize` es el campo que trae los píxeles (ver nota superior).
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
 * Especificaciones complementarias, agrupadas por bloque temático. No las pide
 * el enunciado; enriquecen la ficha sin ensuciar el bloque obligatorio.
 *
 * A diferencia de las obligatorias, **una fila sin dato se omite por completo**
 * en lugar de mostrar un marcador. Si el API no trae la GPU, no aparece ni la
 * etiqueta "GPU": aquí el hueco no informaría de nada y, multiplicado por las
 * veinte filas del bloque, convertiría la ficha en una lista de ausencias.
 *
 * Un grupo que se queda sin ninguna fila desaparece también, para no dejar un
 * título huérfano.
 *
 * @param {object} product Detalle de producto del API.
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
        // `displayResolution` trae las pulgadas (ver nota superior).
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
 * Normaliza las opciones de compra.
 *
 * El enunciado exige mostrar el selector aunque solo haya una opción y dejarla
 * seleccionada por defecto; devolver siempre arrays permite que el componente
 * no tenga que distinguir casos.
 *
 * @param {object} product Detalle de producto del API.
 * @returns {{ colors: Array<{ code: number, name: string }>, storages: Array<{ code: number, name: string }> }}
 */
export function getPurchaseOptions(product) {
  const options = product?.options ?? {};

  const sanitize = (list) =>
    (Array.isArray(list) ? list : [])
      .filter((option) => option && option.code !== undefined && option.code !== null)
      .map((option) => ({
        code: option.code,
        name: formatSpecValue(option.name) ?? MISSING_VALUE,
      }));

  return {
    colors: sanitize(options.colors),
    storages: sanitize(options.storages),
  };
}
