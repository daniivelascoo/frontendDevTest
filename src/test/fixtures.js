/**
 * Datos de prueba con la forma exacta que devuelve el API real.
 *
 * Se han copiado de respuestas reales (incluidas sus erratas de nombre, como
 * `dimentions` o `secondaryCmera`): un fixture que "arregla" el contrato del
 * servidor haría pasar tests que fallarían en producción.
 */

/** @type {Array<object>} */
export const productListFixture = [
  {
    id: 'ZmGrkLRPXOTpxsU4jjAcv',
    brand: 'Acer',
    model: 'Iconia Talk S',
    price: '170',
    imgUrl: 'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
  },
  {
    id: 'sBnkNCTsVLTjXCYFtqB0f',
    brand: 'Samsung',
    model: 'Galaxy S9',
    price: '699',
    imgUrl: 'https://itx-frontend-test.onrender.com/images/sBnkNCTsVLTjXCYFtqB0f.jpg',
  },
  {
    id: 'x2mQPKvXcW5tSyQdQ0Byq',
    brand: 'Xiaomi',
    model: 'Redmi Note 7',
    price: '199',
    imgUrl: 'https://itx-frontend-test.onrender.com/images/x2mQPKvXcW5tSyQdQ0Byq.jpg',
  },
  {
    id: 'kQ0LmZ8nRvXyT1sWpE3Ac',
    brand: 'Apple',
    model: 'iPhone 11 Pro',
    // Producto sin precio: el catálogo real contiene casos así.
    price: '',
    imgUrl: 'https://itx-frontend-test.onrender.com/images/kQ0LmZ8nRvXyT1sWpE3Ac.jpg',
  },
];

/** Detalle con varias opciones de color y almacenamiento. */
export const productDetailFixture = {
  id: 'ZmGrkLRPXOTpxsU4jjAcv',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  imgUrl: 'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
  networkTechnology: 'GSM / HSPA / LTE',
  networkSpeed: 'HSPA 42.2/11.5 Mbps  LTE Cat4 150/50 Mbps',
  gprs: 'Yes',
  edge: 'Yes',
  announced: '2016  August',
  status: 'Available. Released 2016  October',
  dimentions: '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)',
  weight: '260',
  sim: 'Dual SIM (Micro-SIM/Nano-SIM)',
  displayType: 'IPS LCD capacitive touchscreen  16M colors',
  displayResolution: '7.0 inches (~69.8% screen-to-body ratio)',
  displaySize: '720 x 1280 pixels (~210 ppi pixel density)',
  os: 'Android 6.0 (Marshmallow)',
  cpu: 'Quad-core 1.3 GHz Cortex-A53',
  chipset: 'Mediatek MT8735',
  gpu: 'Mali-T720MP2',
  externalMemory: 'microSD  up to 128 GB (dedicated slot)',
  internalMemory: ['16 GB', '32 GB'],
  ram: '2 GB RAM',
  primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: ['2 MP', '720p'],
  speaker: 'Yes',
  audioJack: 'Yes',
  wlan: ['Wi-Fi 802.11 a/b/g/n', 'Wi-Fi Direct', 'hotspot'],
  bluetooth: ['4.0', 'A2DP'],
  gps: 'Yes with A-GPS GLONASS',
  nfc: '',
  radio: 'FM radio',
  usb: 'microUSB 2.0',
  sensors: ['Accelerometer', 'proximity'],
  battery: 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)',
  colors: ['Black'],
  options: {
    colors: [
      { code: 1000, name: 'Black' },
      { code: 1001, name: 'Silver' },
    ],
    storages: [
      { code: 2000, name: '16 GB' },
      { code: 2001, name: '32 GB' },
    ],
  },
};

/**
 * Detalle al que le faltan datos, en todas las formas en que el API los omite:
 * cadena vacía, espacios en blanco, `null`, ausencia del campo y array vacío.
 *
 * Sirve para comprobar las dos reglas opuestas de la ficha: los atributos
 * obligatorios muestran un guion y los secundarios desaparecen.
 */
export const incompleteProductFixture = {
  id: 'incompleto-0001',
  brand: 'Genérica',
  model: 'Modelo Básico',
  price: '',
  imgUrl: '',
  // Obligatorios ausentes.
  cpu: '',
  ram: '   ',
  os: null,
  displaySize: '',
  battery: '',
  primaryCamera: [],
  secondaryCmera: '',
  dimentions: '',
  weight: '',
  // Secundarios ausentes: no deben aparecer ni sus etiquetas.
  gpu: '',
  chipset: null,
  nfc: '',
  radio: '   ',
  sensors: [],
  // Algún secundario sí presente, para que su grupo no desaparezca entero.
  usb: 'USB-C 2.0',
  options: {
    colors: [{ code: 1000, name: 'Negro' }],
    storages: [{ code: 2000, name: '64 GB' }],
  },
};

/** Detalle con una única opción por grupo, para el caso de preselección. */
export const singleOptionProductFixture = {
  ...productDetailFixture,
  id: 'sBnkNCTsVLTjXCYFtqB0f',
  brand: 'Samsung',
  model: 'Galaxy S9',
  price: '699',
  options: {
    colors: [{ code: 1000, name: 'Midnight Black' }],
    storages: [{ code: 2000, name: '64 GB' }],
  },
};
