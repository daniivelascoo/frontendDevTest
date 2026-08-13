import { beforeEach, describe, expect, it } from 'vitest';
import { act, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { ProductListPage } from './ProductListPage.jsx';
import { invalidateProductCache } from '../api/products.js';
import { buildProductListFixture, productListFixture } from '../test/fixtures.js';
import { mockFetch, triggerIntersection } from '../test/helpers.js';
import { saveListPosition } from '../lib/listPosition.js';
import { renderWithProviders } from '../test/utils.jsx';

/** Waits for the loading skeleton to disappear. */
async function waitForCatalogue() {
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando productos'));
}

describe('ProductListPage', () => {
  beforeEach(() => {
    invalidateProductCache();
  });

  it('shows the catalogue returned by the API', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    expect(screen.getByRole('heading', { name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(productListFixture.length);
  });

  it('shows image, brand, model and price for each product', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const card = screen.getByRole('heading', { name: 'Galaxy S9' }).closest('article');

    expect(within(card).getByRole('img', { name: 'Samsung Galaxy S9' })).toBeInTheDocument();
    expect(within(card).getByText('Samsung')).toBeInTheDocument();
    expect(within(card).getByText(/699/)).toBeInTheDocument();
  });

  it('indicates when a product has no price', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const card = screen.getByRole('heading', { name: 'iPhone 11 Pro' }).closest('article');

    expect(within(card).getByText('Precio no disponible')).toBeInTheDocument();
  });

  it('links each product to its detail page', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const link = screen.getByRole('heading', { name: 'Galaxy S9' }).closest('a');

    expect(link).toHaveAttribute('href', '/product/sBnkNCTsVLTjXCYFtqB0f');
  });

  it('filters by brand as the user types', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument();
    });
  });

  it('filters by model', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'redmi');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Redmi Note 7' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Galaxy S9' })).not.toBeInTheDocument();
    });
  });

  it('filters without requesting the data from the API again', async () => {
    const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports when the search returns no results', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'nokia');

    expect(await screen.findByText(/Sin resultados para «nokia»/)).toBeInTheDocument();
  });

  it('allows clearing the search and recovering the whole catalogue', async () => {
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

  it('keeps the search term arriving in the URL', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />, { route: '/?q=xiaomi' });
    await waitForCatalogue();

    expect(screen.getByRole('searchbox')).toHaveValue('xiaomi');
    expect(await screen.findByRole('heading', { name: 'Redmi Note 7' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Galaxy S9' })).not.toBeInTheDocument();
  });

  describe('infinite scroll', () => {
    /** A catalogue of 30 products: two full batches and a half. */
    const largeCatalogue = buildProductListFixture(30);

    /** Counts the product cards currently painted. */
    const cards = () => screen.getAllByRole('heading', { level: 2 });

    it('shows only the first batch of twelve products', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(cards()).toHaveLength(12);
      expect(screen.getByText('Mostrando 12 de 30 productos')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Modelo 13' })).not.toBeInTheDocument();
    });

    /** Requests another batch and waits for the loading pause to finish. */
    async function loadMore(user) {
      await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));
      await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
        // Generous margin over the loading pause, so the test does not depend
        // on its exact duration.
        timeout: 4000,
      });
    }

    it('extends the list when "load more" is pressed', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      const { user } = renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      await loadMore(user);

      expect(cards()).toHaveLength(24);
      expect(screen.getByRole('heading', { name: 'Modelo 13' })).toBeInTheDocument();
    });

    it('extends the list when the sentinel enters the viewport', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(cards()).toHaveLength(12);

      act(() => triggerIntersection());

      await waitFor(() => expect(cards()).toHaveLength(24), { timeout: 4000 });
    });

    describe('loading pause', () => {
      it('warns that more products are on the way before showing them', async () => {
        mockFetch([{ match: '/api/product', body: largeCatalogue }]);

        const { user } = renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));

        // During the pause: indicator visible and list not extended yet.
        expect(screen.getByLabelText('Cargando más productos')).toBeInTheDocument();
        expect(cards()).toHaveLength(12);

        await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
          // Generous margin over the loading pause, so the test does not depend
          // on its exact duration.
          timeout: 4000,
        });

        expect(cards()).toHaveLength(24);
      });

      it('keeps the button mounted during the pause, so focus is not lost', async () => {
        mockFetch([{ match: '/api/product', body: largeCatalogue }]);

        const { user } = renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));

        const button = screen.getByRole('button', { name: /Cargando/ });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');

        await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
          // Generous margin over the loading pause, so the test does not depend
          // on its exact duration.
          timeout: 4000,
        });
      });

      it('does not chain several batches if the sentinel fires repeatedly', async () => {
        mockFetch([{ match: '/api/product', body: largeCatalogue }]);

        renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        // The observer can fire several times during the pause.
        act(() => {
          triggerIntersection();
          triggerIntersection();
          triggerIntersection();
        });

        await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
          // Generous margin over the loading pause, so the test does not depend
          // on its exact duration.
          timeout: 4000,
        });

        // A single batch, not three.
        expect(cards()).toHaveLength(24);
      });

      it('discards the in-flight batch if the search changes', async () => {
        mockFetch([{ match: '/api/product', body: largeCatalogue }]);

        const { user } = renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));
        // Without waiting for it to finish, the search term is changed.
        await user.type(screen.getByRole('searchbox'), 'marca');

        await waitFor(() => expect(cards()).toHaveLength(12), { timeout: 4000 });

        // The pending batch belonged to the previous list: it must not apply.
        expect(screen.queryByLabelText('Cargando más productos')).not.toBeInTheDocument();
      });
    });

    it('stops offering more once everything is visible', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      const { user } = renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      await loadMore(user);
      await loadMore(user);

      expect(cards()).toHaveLength(30);
      expect(
        screen.queryByRole('button', { name: 'Cargar más productos' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Has llegado al final del catálogo.')).toBeInTheDocument();
    });

    it('does not offer to load more if the catalogue fits in one batch', async () => {
      mockFetch([{ match: '/api/product', body: productListFixture }]);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(
        screen.queryByRole('button', { name: 'Cargar más productos' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Mostrando 4 de 4 productos')).toBeInTheDocument();
    });

    it('goes back to the first batch when the search changes', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      const { user } = renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      await loadMore(user);
      expect(cards()).toHaveLength(24);

      // Every product shares the same brand, so there are still 30.
      await user.type(screen.getByRole('searchbox'), 'marca');

      await waitFor(() => expect(cards()).toHaveLength(12));
    });

    it('restores the position when returning from a product detail page', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      // This is what the page leaves stored before navigating to the detail.
      saveListPosition('', 24);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(cards()).toHaveLength(24);
    });

    it('ignores the stored position if the search term is a different one', async () => {
      mockFetch([{ match: '/api/product', body: largeCatalogue }]);

      // The position belongs to another list: restoring it would show an
      // arbitrary number of results from a different search.
      saveListPosition('otra-cosa', 24);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(cards()).toHaveLength(12);
    });
  });

  it('shows an error with a retry option if the load fails', async () => {
    mockFetch([{ match: '/api/product', status: 500 }]);

    renderWithProviders(<ProductListPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el catálogo'
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('loads the catalogue again when retry is pressed', async () => {
    const fetchMock = mockFetch([{ match: '/api/product', status: 500 }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await screen.findByRole('alert');

    // From here on the API responds correctly.
    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(productListFixture),
    }));

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
  });
});
