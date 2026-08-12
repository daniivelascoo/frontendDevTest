import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { ProductDetailPage } from './ProductDetailPage.jsx';
import { invalidateProductCache } from '../api/products.js';
import {
  incompleteProductFixture,
  productDetailFixture,
  singleOptionProductFixture,
} from '../test/fixtures.js';
import { mockFetch } from '../test/helpers.js';
import { renderWithProviders } from '../test/utils.jsx';

/** Monta la PDP en la ruta del producto del fixture. */
function renderDetail(options = {}) {
  return renderWithProviders(<ProductDetailPage />, {
    route: `/product/${productDetailFixture.id}`,
    path: '/product/:id',
    ...options,
  });
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    invalidateProductCache();
  });

  it('muestra la imagen y el nombre del producto', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Iconia Talk S');
    expect(screen.getByRole('img', { name: 'Acer Iconia Talk S' })).toBeInTheDocument();
  });

  it('muestra los once atributos que exige el enunciado', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    const description = await screen.findByRole('region', { name: 'Descripción' });

    const expectedLabels = [
      'Marca',
      'Modelo',
      'Precio',
      'CPU',
      'RAM',
      'Sistema operativo',
      'Resolución de pantalla',
      'Batería',
      'Cámaras',
      'Dimensiones',
      'Peso',
    ];

    expectedLabels.forEach((label) => {
      expect(within(description).getByText(label)).toBeInTheDocument();
    });

    expect(within(description).getByText('Quad-core 1.3 GHz Cortex-A53')).toBeInTheDocument();
    expect(within(description).getByText('260 g')).toBeInTheDocument();
  });

  it('ofrece un enlace de vuelta al listado', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    const backLink = await screen.findByRole('link', { name: /Volver al listado de productos/ });

    expect(backLink).toHaveAttribute('href', '/');
  });

  it('muestra los selectores de almacenamiento y color', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    expect(await screen.findByRole('group', { name: /Almacenamiento/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Color/ })).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: '16 GB' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeInTheDocument();
  });

  it('preselecciona la primera opción de cada grupo', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    await screen.findByRole('radio', { name: '16 GB' });

    expect(screen.getByRole('radio', { name: '16 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '32 GB' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeChecked();
  });

  it('muestra el selector con la opción marcada aunque solo haya una', async () => {
    mockFetch([{ match: '/api/product/', body: singleOptionProductFixture }]);

    renderDetail();

    expect(await screen.findByRole('radio', { name: '64 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Midnight Black' })).toBeChecked();
  });

  it('permite cambiar la opción seleccionada', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    const { user } = renderDetail();
    await screen.findByRole('radio', { name: '32 GB' });

    await user.click(screen.getByRole('radio', { name: '32 GB' }));

    expect(screen.getByRole('radio', { name: '32 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '16 GB' })).not.toBeChecked();
  });

  it('envía al API el producto con los códigos seleccionados', async () => {
    const fetchMock = mockFetch([
      { match: '/api/cart', body: { count: 1 } },
      { match: '/api/product/', body: productDetailFixture },
    ]);

    const { user } = renderDetail();
    await screen.findByRole('radio', { name: '32 GB' });

    await user.click(screen.getByRole('radio', { name: '32 GB' }));
    await user.click(screen.getByRole('radio', { name: 'Silver' }));
    await user.click(screen.getByRole('button', { name: /Añadir a la cesta/ }));

    await waitFor(() => {
      const cartCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/api/cart'));
      expect(cartCall).toBeDefined();
      expect(JSON.parse(cartCall[1].body)).toEqual({
        id: productDetailFixture.id,
        colorCode: 1001,
        storageCode: 2001,
      });
    });
  });

  it('confirma al usuario que el producto se ha añadido', async () => {
    mockFetch([
      { match: '/api/cart', body: { count: 1 } },
      { match: '/api/product/', body: productDetailFixture },
    ]);

    const { user } = renderDetail();
    await screen.findByRole('button', { name: /Añadir a la cesta/ });

    await user.click(screen.getByRole('button', { name: /Añadir a la cesta/ }));

    expect(await screen.findByText('Producto añadido a la cesta.')).toBeInTheDocument();
  });

  it('avisa si el API rechaza la petición de añadir', async () => {
    mockFetch([
      { match: '/api/cart', status: 500 },
      { match: '/api/product/', body: productDetailFixture },
    ]);

    const { user } = renderDetail();
    await screen.findByRole('button', { name: /Añadir a la cesta/ });

    await user.click(screen.getByRole('button', { name: /Añadir a la cesta/ }));

    expect(await screen.findByText(/La petición ha fallado con estado 500/)).toBeInTheDocument();
  });

  describe('datos ausentes', () => {
    it('muestra un guion en los atributos obligatorios que faltan', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      const description = await screen.findByRole('region', { name: 'Descripción' });

      // Del fixture solo llegan marca y modelo: los otros nueve atributos
      // conservan su fila y su etiqueta, con el guion como valor.
      const missingLabels = [
        'Precio',
        'CPU',
        'RAM',
        'Sistema operativo',
        'Resolución de pantalla',
        'Batería',
        'Cámaras',
        'Dimensiones',
        'Peso',
      ];

      missingLabels.forEach((label) => {
        expect(within(description).getByText(label)).toBeInTheDocument();
      });

      expect(within(description).getAllByText('-')).toHaveLength(missingLabels.length);

      // Y los dos que sí llegan mantienen su valor real.
      expect(within(description).getByText('Genérica')).toBeInTheDocument();
      expect(within(description).getByText('Modelo Básico')).toBeInTheDocument();
    });

    it('anuncia la ausencia a los lectores de pantalla, que solo leerían «menos»', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      const description = await screen.findByRole('region', { name: 'Descripción' });

      expect(within(description).getAllByText('Dato no disponible').length).toBeGreaterThan(0);
    });

    it('no muestra las especificaciones secundarias que faltan, ni sus etiquetas', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      const { user } = renderDetail();

      await user.click(await screen.findByText('Ver especificaciones completas'));

      // Ausentes en el fixture: ni etiqueta ni valor.
      ['GPU', 'Chipset', 'NFC', 'Radio', 'Sensores'].forEach((label) => {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      });

      // El que sí llega se muestra, así que su grupo no ha desaparecido.
      expect(screen.getByText('USB')).toBeInTheDocument();
      expect(screen.getByText('USB-C 2.0')).toBeInTheDocument();
    });

    it('no muestra «0 €» cuando el producto no tiene precio', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      await screen.findByRole('region', { name: 'Descripción' });

      expect(screen.queryByText(/0\s*€/)).not.toBeInTheDocument();
      expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    });

    it('sigue mostrando los selectores aunque el producto no se pueda comprar', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      // Las opciones existen y se preseleccionan; lo que falta es el precio.
      expect(await screen.findByRole('radio', { name: '64 GB' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Negro' })).toBeChecked();
    });
  });

  describe('productos que no se pueden comprar', () => {
    const addButton = () => screen.getByRole('button', { name: /Añadir a la cesta/ });

    it('deshabilita el botón y explica el motivo cuando falta el precio', async () => {
      // El fixture trae opciones de color y almacenamiento, pero `price: ''`.
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      expect(
        await screen.findByText(
          'Este producto no está disponible para la compra porque no tiene precio.'
        )
      ).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('deshabilita el botón cuando faltan las opciones de almacenamiento', async () => {
      mockFetch([
        {
          match: '/api/product/',
          body: {
            ...productDetailFixture,
            options: { colors: productDetailFixture.options.colors, storages: [] },
          },
        },
      ]);

      renderDetail();

      expect(await screen.findByText(/no tiene opciones de almacenamiento\./)).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('deshabilita el botón cuando faltan las opciones de color', async () => {
      mockFetch([
        {
          match: '/api/product/',
          body: {
            ...productDetailFixture,
            options: { colors: [], storages: productDetailFixture.options.storages },
          },
        },
      ]);

      renderDetail();

      expect(await screen.findByText(/no tiene opciones de color\./)).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('enumera todos los motivos cuando falta más de una cosa', async () => {
      mockFetch([
        { match: '/api/product/', body: { ...incompleteProductFixture, options: undefined } },
      ]);

      renderDetail();

      expect(
        await screen.findByText(
          'Este producto no está disponible para la compra porque no tiene precio, opciones de almacenamiento ni opciones de color.'
        )
      ).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('asocia la explicación al botón para que un lector de pantalla la anuncie', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      const message = await screen.findByText(/no está disponible para la compra/);

      expect(addButton()).toHaveAttribute('aria-describedby', message.getAttribute('id'));
    });

    it('no llega a llamar al API aunque se fuerce el envío del formulario', async () => {
      const fetchMock = mockFetch([
        { match: '/api/cart', body: { count: 1 } },
        { match: '/api/product/', body: incompleteProductFixture },
      ]);

      const { user } = renderDetail();
      await screen.findByText(/no está disponible para la compra/);

      await user.click(addButton());

      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/api/cart'))).toBe(false);
    });

    it('no muestra ningún aviso cuando el producto sí se puede comprar', async () => {
      mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

      renderDetail();

      await screen.findByRole('radio', { name: '16 GB' });

      expect(screen.queryByText(/no está disponible para la compra/)).not.toBeInTheDocument();
      expect(addButton()).toBeEnabled();
    });
  });

  it('trata un 404 como producto no encontrado y no ofrece reintentar', async () => {
    mockFetch([{ match: '/api/product/', status: 404 }]);

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent('Producto no encontrado');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('ofrece reintentar ante un error de servidor', async () => {
    mockFetch([{ match: '/api/product/', status: 500 }]);

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el producto'
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
