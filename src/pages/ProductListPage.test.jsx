import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { ProductListPage } from './ProductListPage.jsx';
import { invalidateProductCache } from '../api/products.js';
import { productListFixture } from '../test/fixtures.js';
import { mockFetch } from '../test/helpers.js';
import { renderWithProviders } from '../test/utils.jsx';

/** Espera a que desaparezca el esqueleto de carga. */
async function waitForCatalogue() {
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando productos'));
}

describe('ProductListPage', () => {
  beforeEach(() => {
    invalidateProductCache();
  });

  it('muestra el catálogo que devuelve el API', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    expect(screen.getByRole('heading', { name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(productListFixture.length);
  });

  it('muestra imagen, marca, modelo y precio de cada producto', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const card = screen.getByRole('heading', { name: 'Galaxy S9' }).closest('article');

    expect(within(card).getByRole('img', { name: 'Samsung Galaxy S9' })).toBeInTheDocument();
    expect(within(card).getByText('Samsung')).toBeInTheDocument();
    expect(within(card).getByText(/699/)).toBeInTheDocument();
  });

  it('indica cuándo un producto no tiene precio', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const card = screen.getByRole('heading', { name: 'iPhone 11 Pro' }).closest('article');

    expect(within(card).getByText('Precio no disponible')).toBeInTheDocument();
  });

  it('enlaza cada producto con su ficha de detalle', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const link = screen.getByRole('heading', { name: 'Galaxy S9' }).closest('a');

    expect(link).toHaveAttribute('href', '/product/sBnkNCTsVLTjXCYFtqB0f');
  });

  it('filtra por marca a medida que el usuario escribe', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument();
    });
  });

  it('filtra por modelo', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'redmi');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Redmi Note 7' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Galaxy S9' })).not.toBeInTheDocument();
    });
  });

  it('filtra sin volver a pedir los datos al API', async () => {
    const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('informa cuando la búsqueda no devuelve resultados', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'nokia');

    expect(await screen.findByText(/Sin resultados para «nokia»/)).toBeInTheDocument();
  });

  it('permite borrar la búsqueda y recuperar el catálogo completo', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Borrar la búsqueda' }));

    expect(await screen.findByRole('heading', { name: 'Iconia Talk S' })).toBeInTheDocument();
  });

  it('conserva la búsqueda que llega en la URL', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />, { route: '/?q=xiaomi' });
    await waitForCatalogue();

    expect(screen.getByRole('searchbox')).toHaveValue('xiaomi');
    expect(await screen.findByRole('heading', { name: 'Redmi Note 7' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Galaxy S9' })).not.toBeInTheDocument();
  });

  it('muestra un error con opción de reintentar si falla la carga', async () => {
    mockFetch([{ match: '/api/product', status: 500 }]);

    renderWithProviders(<ProductListPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el catálogo'
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('vuelve a cargar el catálogo al pulsar reintentar', async () => {
    const fetchMock = mockFetch([{ match: '/api/product', status: 500 }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await screen.findByRole('alert');

    // A partir de aquí el API responde correctamente.
    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(productListFixture),
    }));

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
  });
});
