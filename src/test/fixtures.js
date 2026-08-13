/**
 * Test data with the exact shape the real API returns.
 *
 * These were copied from real responses (typos included, such as `dimentions`
 * or `secondaryCmera`): a fixture that "fixes" the server's contract would make
 * tests pass that would fail in production.
 *
 * The data values stay in Spanish where the real catalogue has them so, and the
 * synthetic ones (`Marca`, `Modelo N`) are matched literally by the list tests.
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
    // Product without a price: the real catalogue contains cases like this.
    price: '',
    imgUrl: 'https://itx-frontend-test.onrender.com/images/kQ0LmZ8nRvXyT1sWpE3Ac.jpg',
  },
];

/**
 * Generates a catalogue of whatever size is needed.
 *
 * The normal fixture has four products, not enough to exercise the infinite
 * scroll, which shows batches of twelve.
 *
 * @param {number} count
 * @param {string} [brand] Shared brand, so they can all be filtered at once.
 * @returns {Array<object>}
 */
export function buildProductListFixture(count, brand = 'Marca') {
  return Array.from({ length: count }, (_, index) => ({
    id: `producto-${index + 1}`,
    brand,
    model: `Modelo ${index + 1}`,
    price: `${100 + index}`,
    imgUrl: `https://itx-frontend-test.onrender.com/images/producto-${index + 1}.jpg`,
  }));
}

/** Detail with several colour and storage options. */
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
 * A detail with data missing in every way the API omits it: empty string,
 * whitespace, `null`, absent field and empty array.
 *
 * It serves to check the two opposite rules of the product page: mandatory
 * attributes show a dash and secondary ones disappear.
 */
export const incompleteProductFixture = {
  id: 'incompleto-0001',
  brand: 'Genérica',
  model: 'Modelo Básico',
  price: '',
  imgUrl: '',
  // Mandatory ones, absent.
  cpu: '',
  ram: '   ',
  os: null,
  displaySize: '',
  battery: '',
  primaryCamera: [],
  secondaryCmera: '',
  dimentions: '',
  weight: '',
  // Secondary ones, absent: neither they nor their labels should appear.
  gpu: '',
  chipset: null,
  nfc: '',
  radio: '   ',
  sensors: [],
  // Some secondary ones present, so their group does not vanish entirely.
  usb: 'USB-C 2.0',
  options: {
    colors: [{ code: 1000, name: 'Negro' }],
    storages: [{ code: 2000, name: '64 GB' }],
  },
};

/**
 * Product whose only storage option arrives with a blank name.
 *
 * This is not a made-up case: in the real catalogue, Acer DX650 and Acer M900
 * return exactly `storages: [{ code: 2000, name: " " }]`. Having a code is not
 * enough for an option to be eligible; without a name the user cannot know what
 * they are buying.
 */
export const blankOptionNameProductFixture = {
  ...productDetailFixture,
  id: 'mQWbDUsIUEPZy2My8Qxvl',
  brand: 'Acer',
  model: 'DX650',
  price: '120',
  options: {
    colors: [{ code: 1000, name: 'Black' }],
    storages: [{ code: 2000, name: ' ' }],
  },
};

/** Detail with a single option per group, for the preselection case. */
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
