import { describe, expect, it } from 'vitest';
import { getAdditionalSpecGroups, getPurchaseOptions, getRequiredSpecs } from './productSpecs.js';
import { productDetailFixture } from '../test/fixtures.js';

describe('getRequiredSpecs', () => {
  const specs = getRequiredSpecs(productDetailFixture);
  const byId = Object.fromEntries(specs.map((spec) => [spec.id, spec]));

  it('devuelve los once atributos que exige el enunciado', () => {
    expect(specs.map((spec) => spec.id)).toEqual([
      'brand',
      'model',
      'price',
      'cpu',
      'ram',
      'os',
      'displayResolution',
      'battery',
      'cameras',
      'dimentions',
      'weight',
    ]);
  });

  it('toma la resolución de pantalla del campo que contiene los píxeles', () => {
    // El API intercambia `displaySize` y `displayResolution` respecto a su nombre.
    expect(byId.displayResolution.value).toContain('720 x 1280 pixels');
  });

  it('combina las dos cámaras en una sola fila', () => {
    expect(byId.cameras.value).toBe('13 MP, autofocus · 2 MP, 720p');
  });

  it('lee las dimensiones del campo con la errata del API', () => {
    expect(byId.dimentions.value).toContain('191.7 x 101 x 9.4 mm');
  });

  it('añade la unidad al peso', () => {
    expect(byId.weight.value).toBe('260 g');
  });

  describe('datos ausentes', () => {
    /** Producto al que le falta casi todo, en todas sus formas posibles. */
    const incompleteProduct = {
      brand: 'Acer',
      model: 'X',
      price: '',
      cpu: '',
      ram: '   ',
      os: null,
      displaySize: undefined,
      battery: '',
      primaryCamera: [],
      secondaryCmera: '',
      dimentions: '',
      weight: '',
    };

    const incomplete = getRequiredSpecs(incompleteProduct);
    const value = (id) => incomplete.find((spec) => spec.id === id).value;

    it('mantiene las once filas para que las fichas sigan siendo comparables', () => {
      expect(incomplete).toHaveLength(11);
    });

    it('muestra un guion en cada dato obligatorio que falta', () => {
      ['price', 'cpu', 'ram', 'os', 'displayResolution', 'battery', 'dimentions', 'weight'].forEach(
        (id) => expect(value(id)).toBe('-')
      );
    });

    it('trata la cadena vacía, los espacios, null, undefined y [] como ausencia', () => {
      expect(value('cpu')).toBe('-'); // ''
      expect(value('ram')).toBe('-'); // '   '
      expect(value('os')).toBe('-'); // null
      expect(value('displayResolution')).toBe('-'); // undefined
      expect(value('cameras')).toBe('-'); // [] y ''
    });

    it('no muestra «0 €» cuando el producto no tiene precio', () => {
      expect(value('price')).toBe('-');
      expect(value('price')).not.toContain('0');
    });

    it('conserva los datos que sí llegan', () => {
      expect(value('brand')).toBe('Acer');
      expect(value('model')).toBe('X');
    });

    it('muestra la cámara que exista aunque falte la otra', () => {
      const specs = getRequiredSpecs({ primaryCamera: ['13 MP'], secondaryCmera: '' });
      const cameras = specs.find((spec) => spec.id === 'cameras').value;

      expect(cameras).toBe('13 MP');
    });
  });

  it('devuelve una lista vacía si no hay producto', () => {
    expect(getRequiredSpecs(null)).toEqual([]);
  });
});

describe('getAdditionalSpecGroups', () => {
  it('agrupa las especificaciones complementarias', () => {
    const groups = getAdditionalSpecGroups(productDetailFixture);

    expect(groups.map((group) => group.id)).toEqual([
      'display',
      'hardware',
      'connectivity',
      'misc',
    ]);
  });

  it('omite por completo la fila sin dato, etiqueta incluida', () => {
    const groups = getAdditionalSpecGroups(productDetailFixture);
    const connectivity = groups.find((group) => group.id === 'connectivity');

    // `nfc` viene como cadena vacía en el fixture: no debe aparecer ni el
    // valor ni la etiqueta "NFC".
    expect(connectivity.specs.some((spec) => spec.label === 'NFC')).toBe(false);
    expect(connectivity.specs.some((spec) => spec.label === 'USB')).toBe(true);
  });

  it('omite la GPU cuando el API no la trae', () => {
    const sinGpu = getAdditionalSpecGroups({ ...productDetailFixture, gpu: '' });
    const hardware = sinGpu.find((group) => group.id === 'hardware');

    expect(hardware.specs.some((spec) => spec.label === 'GPU')).toBe(false);
    // El resto del grupo sigue en pie.
    expect(hardware.specs.some((spec) => spec.label === 'Chipset')).toBe(true);
  });

  it('nunca usa el marcador de guion en las especificaciones secundarias', () => {
    const groups = getAdditionalSpecGroups({
      ...productDetailFixture,
      gpu: '',
      nfc: null,
      radio: '   ',
      sensors: [],
    });

    const allValues = groups.flatMap((group) => group.specs.map((spec) => spec.value));

    expect(allValues).not.toContain('-');
    expect(allValues.every((value) => value && value.trim().length > 0)).toBe(true);
  });

  it('descarta los grupos que se quedan sin ninguna fila', () => {
    const groups = getAdditionalSpecGroups({ brand: 'Acer', model: 'X' });

    expect(groups).toEqual([]);
  });
});

describe('getPurchaseOptions', () => {
  it('extrae colores y almacenamientos', () => {
    const { colors, storages } = getPurchaseOptions(productDetailFixture);

    expect(colors).toEqual([
      { code: 1000, name: 'Black' },
      { code: 1001, name: 'Silver' },
    ]);
    expect(storages).toHaveLength(2);
  });

  it('devuelve arrays vacíos cuando el producto no trae opciones', () => {
    expect(getPurchaseOptions({})).toEqual({ colors: [], storages: [] });
    expect(getPurchaseOptions(null)).toEqual({ colors: [], storages: [] });
  });

  it('descarta las opciones sin código, que no se podrían enviar al API', () => {
    const { colors } = getPurchaseOptions({
      options: { colors: [{ name: 'Sin código' }, { code: 1, name: 'Válido' }] },
    });

    expect(colors).toEqual([{ code: 1, name: 'Válido' }]);
  });
});
