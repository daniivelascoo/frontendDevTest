import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App } from '../App.jsx';
import { CartProvider } from '../context/CartProvider.jsx';
import { BreadcrumbsProvider } from '../context/BreadcrumbsProvider.jsx';

/**
 * Test helpers that **do** depend on React.
 *
 * The ones that do not (`mockFetch`, `createTestStorage`) live in `helpers.js`,
 * so that pure-logic tests need not load Testing Library, the router or the
 * application providers.
 */

/**
 * Renders a component with the providers and the router it needs.
 *
 * @param {import('react').ReactElement} ui
 * @param {object} [options]
 * @param {string} [options.route] Initial route for the `MemoryRouter`.
 * @param {string} [options.path] Route pattern, if the component uses `useParams`.
 * @param {Storage} [options.storage] Storage for the cart.
 */
export function renderWithProviders(ui, { route = '/', path, storage, ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <CartProvider storage={storage}>
          <BreadcrumbsProvider>
            {path ? <Routes>{<Route path={path} element={children} />}</Routes> : children}
          </BreadcrumbsProvider>
        </CartProvider>
      </MemoryRouter>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

/**
 * Mounts the whole application on a given route.
 *
 * `renderWithProviders` mounts a single view and therefore leaves out the
 * header. For what lives there — the cart counter and the breadcrumbs — and to
 * exercise the routing table, `<App>` has to be mounted; it already brings its
 * own providers, so only the router is added here.
 *
 * The cart uses jsdom's `localStorage`, which the global `afterEach` clears. To
 * start with a previous counter, write it to `window.localStorage` before
 * calling.
 *
 * @param {object} [options]
 * @param {string} [options.route] Initial route.
 */
export function renderApp({ route = '/' } = {}) {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    ),
  };
}
