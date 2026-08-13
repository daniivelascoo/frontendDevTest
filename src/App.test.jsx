import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import { invalidateProductCache } from './api/products.js';
import { CART_STORAGE_KEY } from './context/CartProvider.jsx';
import { productDetailFixture, productListFixture } from './test/fixtures.js';
import { mockFetch } from './test/helpers.js';
import { renderApp } from './test/utils.jsx';

/**
 * Tests of the whole application mounted together: the routing table and what
 * lives in the header, which the per-page tests never see because they mount
 * the view on its own.
 */

/** API routes, from the most specific to the most general. */
const apiRoutes = [
  { match: '/api/cart', body: { count: 1 } },
  // With a trailing slash only the detail endpoint matches; the list is `/api/product`.
  { match: '/api/product/', body: productDetailFixture },
  { match: '/api/product', body: productListFixture },
];

const detailRoute = `/product/${productDetailFixture.id}`;

/** Waits for the list skeleton to disappear. */
const waitForCatalogue = () =>
  waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando productos'));

/**
 * Waits for the detail page to be painted.
 *
 * It waits for the title rather than for the spinner to disappear: when
 * navigating from the list, the stubbed response can resolve before the spinner
 * even mounts, and `waitForElementToBeRemoved` requires the element to have
 * existed.
 */
const waitForDetail = () => screen.findByRole('heading', { level: 1 });

describe('App', () => {
  beforeEach(() => {
    invalidateProductCache();
    mockFetch(apiRoutes);
  });

  describe('routes', () => {
    it('shows the list at the root', async () => {
      renderApp();
      await waitForCatalogue();

      expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('shows the product detail at /product/:id', async () => {
      renderApp({ route: detailRoute });
      await waitForDetail();

      expect(screen.getByRole('heading', { level: 1, name: /Iconia Talk S/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Añadir a la cesta' })).toBeInTheDocument();
    });

    it('shows the not-found page on an unknown route', () => {
      renderApp({ route: '/una-ruta-que-no-existe' });

      // Scoped by the message's role: the text also appears in the breadcrumbs.
      expect(screen.getByRole('status')).toHaveTextContent('Página no encontrada');
    });

    it('allows going back to the list from the not-found page', async () => {
      const { user } = renderApp({ route: '/una-ruta-que-no-existe' });

      await user.click(screen.getByRole('link', { name: 'Volver al listado de productos' }));

      expect(await screen.findByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    });

    it('navigates from the list to the detail when a product is clicked', async () => {
      const { user } = renderApp();
      await waitForCatalogue();

      await user.click(screen.getByRole('heading', { name: 'Iconia Talk S' }));
      await waitForDetail();

      expect(screen.getByRole('button', { name: 'Añadir a la cesta' })).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('is present on every view', async () => {
      renderApp({ route: detailRoute });
      await waitForDetail();

      expect(
        screen.getByRole('link', { name: 'Mobile Store, ir a la página principal' })
      ).toBeInTheDocument();
    });

    it('reflects the current page in the breadcrumbs', async () => {
      renderApp({ route: detailRoute });
      await waitForDetail();

      const breadcrumbs = screen.getByRole('navigation', { name: 'Ruta de navegación' });

      // The last crumb takes the product name from an effect, so it resolves
      // one render after the title is already painted.
      expect(await within(breadcrumbs).findByText('Acer Iconia Talk S')).toBeInTheDocument();
      expect(within(breadcrumbs).getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    });
  });

  describe('cart counter', () => {
    it('is shown in the header of the list', async () => {
      renderApp();
      await waitForCatalogue();

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    it('is shown on the product detail page too', async () => {
      renderApp({ route: detailRoute });
      await waitForDetail();

      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    it('updates in the header when a product is added to the cart', async () => {
      const { user } = renderApp({ route: detailRoute });
      await waitForDetail();

      await user.click(screen.getByRole('button', { name: 'Añadir a la cesta' }));

      // The value shown is the one the API returns, not a local increment.
      expect(await screen.findByText('Producto añadido a la cesta.')).toBeInTheDocument();
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });

    it('keeps the number of items when changing view', async () => {
      const { user } = renderApp({ route: detailRoute });
      await waitForDetail();

      await user.click(screen.getByRole('button', { name: 'Añadir a la cesta' }));
      await screen.findByText('Producto añadido a la cesta.');

      await user.click(screen.getByRole('link', { name: /Volver al listado de productos/ }));
      await screen.findByRole('heading', { name: 'Galaxy S9' });

      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });

    it('recovers the number of items from a previous visit', async () => {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(4));

      renderApp();
      await waitForCatalogue();

      expect(screen.getByTestId('cart-count')).toHaveTextContent('4');
    });
  });
});
