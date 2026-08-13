import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { ProductDetailPage } from './ProductDetailPage.jsx';
import { invalidateProductCache } from '../api/products.js';
import {
  blankOptionNameProductFixture,
  incompleteProductFixture,
  productDetailFixture,
  singleOptionProductFixture,
} from '../test/fixtures.js';
import { mockFetch } from '../test/helpers.js';
import { renderWithProviders } from '../test/utils.jsx';

/** Mounts the PDP on the route of the fixture product. */
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

  it('shows the product image and name', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Iconia Talk S');
    expect(screen.getByRole('img', { name: 'Acer Iconia Talk S' })).toBeInTheDocument();
  });

  it('shows the eleven attributes required by the brief', async () => {
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

  it('offers a link back to the list', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    const backLink = await screen.findByRole('link', { name: /Volver al listado de productos/ });

    expect(backLink).toHaveAttribute('href', '/');
  });

  it('shows the storage and colour selectors', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    expect(await screen.findByRole('group', { name: /Almacenamiento/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Color/ })).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: '16 GB' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeInTheDocument();
  });

  it('preselects the first option of each group', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    renderDetail();

    await screen.findByRole('radio', { name: '16 GB' });

    expect(screen.getByRole('radio', { name: '16 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '32 GB' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeChecked();
  });

  it('shows the selector with its option checked even when there is only one', async () => {
    mockFetch([{ match: '/api/product/', body: singleOptionProductFixture }]);

    renderDetail();

    expect(await screen.findByRole('radio', { name: '64 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Midnight Black' })).toBeChecked();
  });

  it('allows changing the selected option', async () => {
    mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

    const { user } = renderDetail();
    await screen.findByRole('radio', { name: '32 GB' });

    await user.click(screen.getByRole('radio', { name: '32 GB' }));

    expect(screen.getByRole('radio', { name: '32 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '16 GB' })).not.toBeChecked();
  });

  it('sends the product to the API with the selected codes', async () => {
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

  it('confirms to the user that the product was added', async () => {
    mockFetch([
      { match: '/api/cart', body: { count: 1 } },
      { match: '/api/product/', body: productDetailFixture },
    ]);

    const { user } = renderDetail();
    await screen.findByRole('button', { name: /Añadir a la cesta/ });

    await user.click(screen.getByRole('button', { name: /Añadir a la cesta/ }));

    expect(await screen.findByText('Producto añadido a la cesta.')).toBeInTheDocument();
  });

  it('warns the user if the API rejects the add request', async () => {
    mockFetch([
      { match: '/api/cart', status: 500 },
      { match: '/api/product/', body: productDetailFixture },
    ]);

    const { user } = renderDetail();
    await screen.findByRole('button', { name: /Añadir a la cesta/ });

    await user.click(screen.getByRole('button', { name: /Añadir a la cesta/ }));

    expect(await screen.findByText(/La petición ha fallado con estado 500/)).toBeInTheDocument();
  });

  describe('missing data', () => {
    it('shows a dash for the missing mandatory attributes', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      const description = await screen.findByRole('region', { name: 'Descripción' });

      // Only brand and model arrive in the fixture: the other nine attributes
      // keep their row and their label, with the dash as the value.
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

      // And the two that do arrive keep their real value.
      expect(within(description).getByText('Genérica')).toBeInTheDocument();
      expect(within(description).getByText('Modelo Básico')).toBeInTheDocument();
    });

    it('announces the absence to screen readers, which would only read "minus"', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      const description = await screen.findByRole('region', { name: 'Descripción' });

      expect(within(description).getAllByText('Dato no disponible').length).toBeGreaterThan(0);
    });

    it('hides the missing secondary specifications, labels included', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      const { user } = renderDetail();

      await user.click(await screen.findByText('Ver especificaciones completas'));

      // Absent in the fixture: neither label nor value.
      ['GPU', 'Chipset', 'NFC', 'Radio', 'Sensores'].forEach((label) => {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      });

      // The one that does arrive is shown, so its group has not disappeared.
      expect(screen.getByText('USB')).toBeInTheDocument();
      expect(screen.getByText('USB-C 2.0')).toBeInTheDocument();
    });

    it('does not show "0 €" when the product has no price', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      await screen.findByRole('region', { name: 'Descripción' });

      expect(screen.queryByText(/0\s*€/)).not.toBeInTheDocument();
      expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    });

    it('still shows the selectors even when the product cannot be bought', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      // The options exist and are preselected; what is missing is the price.
      expect(await screen.findByRole('radio', { name: '64 GB' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Negro' })).toBeChecked();
    });
  });

  describe('products that cannot be bought', () => {
    const addButton = () => screen.getByRole('button', { name: /Añadir a la cesta/ });

    it('disables the button and explains why when the price is missing', async () => {
      // The fixture carries colour and storage options, but `price: ''`.
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      expect(
        await screen.findByText(
          'Este producto no está disponible para la compra porque no tiene precio.'
        )
      ).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });

    it('disables the button when the storage options are missing', async () => {
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

    it('disables the button when the colour options are missing', async () => {
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

    it('lists every reason when more than one thing is missing', async () => {
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

    it('links the explanation to the button so a screen reader announces it', async () => {
      mockFetch([{ match: '/api/product/', body: incompleteProductFixture }]);

      renderDetail();

      const message = await screen.findByText(/no está disponible para la compra/);

      expect(addButton()).toHaveAttribute('aria-describedby', message.getAttribute('id'));
    });

    it('never calls the API even if the form submission is forced', async () => {
      const fetchMock = mockFetch([
        { match: '/api/cart', body: { count: 1 } },
        { match: '/api/product/', body: incompleteProductFixture },
      ]);

      const { user } = renderDetail();
      await screen.findByText(/no está disponible para la compra/);

      await user.click(addButton());

      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/api/cart'))).toBe(false);
    });

    it('offers no "-" pill and no purchase when an option has no name', async () => {
      // Regression: Acer DX650 returns `storages: [{ code: 2000, name: " " }]`.
      // Having a code made it count as a valid option, so a pill with a dash
      // was painted and the product could be added to the cart.
      mockFetch([{ match: '/api/product/', body: blankOptionNameProductFixture }]);

      renderDetail();

      expect(await screen.findByText(/no tiene opciones de almacenamiento\./)).toBeInTheDocument();
      expect(addButton()).toBeDisabled();

      // No radio should be left with the placeholder as its label.
      expect(screen.queryByRole('radio', { name: '-' })).not.toBeInTheDocument();
      // The storage group disappears; the colour one, which is valid, does not.
      expect(screen.queryByRole('group', { name: /Almacenamiento/ })).not.toBeInTheDocument();
      expect(screen.getByRole('group', { name: /Color/ })).toBeInTheDocument();
    });

    it('shows no notice when the product can indeed be bought', async () => {
      mockFetch([{ match: '/api/product/', body: productDetailFixture }]);

      renderDetail();

      await screen.findByRole('radio', { name: '16 GB' });

      expect(screen.queryByText(/no está disponible para la compra/)).not.toBeInTheDocument();
      expect(addButton()).toBeEnabled();
    });
  });

  it('treats a 404 as product not found and offers no retry', async () => {
    mockFetch([{ match: '/api/product/', status: 404 }]);

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent('Producto no encontrado');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('offers a retry on a server error', async () => {
    mockFetch([{ match: '/api/product/', status: 500 }]);

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el producto'
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
