import { describe, expect, it } from 'vitest';
import { getAdditionalSpecGroups, getPurchaseOptions, getRequiredSpecs } from './productSpecs.js';
import { productDetailFixture } from '../test/fixtures.js';

describe('getRequiredSpecs', () => {
  const specs = getRequiredSpecs(productDetailFixture);
  const byId = Object.fromEntries(specs.map((spec) => [spec.id, spec]));

  it('returns the eleven attributes required by the brief', () => {
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

  it('takes the screen resolution from the field holding the pixels', () => {
    // The API swaps `displaySize` and `displayResolution` against their names.
    expect(byId.displayResolution.value).toContain('720 x 1280 pixels');
  });

  it('combines both cameras into a single row', () => {
    expect(byId.cameras.value).toBe('13 MP, autofocus · 2 MP, 720p');
  });

  it('reads the dimensions from the field carrying the API typo', () => {
    expect(byId.dimentions.value).toContain('191.7 x 101 x 9.4 mm');
  });

  it('adds the unit to the weight', () => {
    expect(byId.weight.value).toBe('260 g');
  });

  describe('missing data', () => {
    /** A product missing almost everything, in every possible form. */
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

    it('keeps the eleven rows so spec sheets stay comparable', () => {
      expect(incomplete).toHaveLength(11);
    });

    it('shows a dash for every missing mandatory value', () => {
      ['price', 'cpu', 'ram', 'os', 'displayResolution', 'battery', 'dimentions', 'weight'].forEach(
        (id) => expect(value(id)).toBe('-')
      );
    });

    it('treats empty string, whitespace, null, undefined and [] as absence', () => {
      expect(value('cpu')).toBe('-'); // ''
      expect(value('ram')).toBe('-'); // '   '
      expect(value('os')).toBe('-'); // null
      expect(value('displayResolution')).toBe('-'); // undefined
      expect(value('cameras')).toBe('-'); // [] and ''
    });

    it('does not show "0 €" when the product has no price', () => {
      expect(value('price')).toBe('-');
      expect(value('price')).not.toContain('0');
    });

    it('keeps the values that do arrive', () => {
      expect(value('brand')).toBe('Acer');
      expect(value('model')).toBe('X');
    });

    it('shows whichever camera exists even if the other is missing', () => {
      const specs = getRequiredSpecs({ primaryCamera: ['13 MP'], secondaryCmera: '' });
      const cameras = specs.find((spec) => spec.id === 'cameras').value;

      expect(cameras).toBe('13 MP');
    });
  });

  it('returns an empty list when there is no product', () => {
    expect(getRequiredSpecs(null)).toEqual([]);
  });
});

describe('getAdditionalSpecGroups', () => {
  it('groups the complementary specifications', () => {
    const groups = getAdditionalSpecGroups(productDetailFixture);

    expect(groups.map((group) => group.id)).toEqual([
      'display',
      'hardware',
      'connectivity',
      'misc',
    ]);
  });

  it('omits a row without data entirely, label included', () => {
    const groups = getAdditionalSpecGroups(productDetailFixture);
    const connectivity = groups.find((group) => group.id === 'connectivity');

    // `nfc` arrives as an empty string in the fixture: neither the value nor
    // the "NFC" label should appear.
    expect(connectivity.specs.some((spec) => spec.label === 'NFC')).toBe(false);
    expect(connectivity.specs.some((spec) => spec.label === 'USB')).toBe(true);
  });

  it('omits the GPU when the API does not provide it', () => {
    const sinGpu = getAdditionalSpecGroups({ ...productDetailFixture, gpu: '' });
    const hardware = sinGpu.find((group) => group.id === 'hardware');

    expect(hardware.specs.some((spec) => spec.label === 'GPU')).toBe(false);
    // The rest of the group still stands.
    expect(hardware.specs.some((spec) => spec.label === 'Chipset')).toBe(true);
  });

  it('never uses the dash placeholder in secondary specifications', () => {
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

  it('discards the groups left without any row', () => {
    const groups = getAdditionalSpecGroups({ brand: 'Acer', model: 'X' });

    expect(groups).toEqual([]);
  });
});

describe('getPurchaseOptions', () => {
  it('extracts colours and storage options', () => {
    const { colors, storages } = getPurchaseOptions(productDetailFixture);

    expect(colors).toEqual([
      { code: 1000, name: 'Black' },
      { code: 1001, name: 'Silver' },
    ]);
    expect(storages).toHaveLength(2);
  });

  it('returns empty arrays when the product carries no options', () => {
    expect(getPurchaseOptions({})).toEqual({ colors: [], storages: [] });
    expect(getPurchaseOptions(null)).toEqual({ colors: [], storages: [] });
  });

  it('discards options without a code, which could not be sent to the API', () => {
    const { colors } = getPurchaseOptions({
      options: { colors: [{ name: 'Sin código' }, { code: 1, name: 'Válido' }] },
    });

    expect(colors).toEqual([{ code: 1, name: 'Válido' }]);
  });

  it('discards options without a name, which the user could not choose', () => {
    // Real catalogue case: Acer DX650 returns `[{ code: 2000, name: " " }]`.
    const { storages } = getPurchaseOptions({
      options: { storages: [{ code: 2000, name: ' ' }] },
    });

    expect(storages).toEqual([]);
  });

  it.each([
    ['an empty string', ''],
    ['whitespace', '   '],
    ['null', null],
    ['undefined', undefined],
  ])('discards an option whose name is %s', (_label, name) => {
    const { colors } = getPurchaseOptions({ options: { colors: [{ code: 1000, name }] } });

    expect(colors).toEqual([]);
  });

  it('keeps the valid options even when a sibling is not', () => {
    const { storages } = getPurchaseOptions({
      options: {
        storages: [
          { code: 2000, name: ' ' },
          { code: 2001, name: '64 GB' },
        ],
      },
    });

    expect(storages).toEqual([{ code: 2001, name: '64 GB' }]);
  });
});
