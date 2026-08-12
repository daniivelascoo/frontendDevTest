import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from '../context/CartProvider.jsx';
import { BreadcrumbsProvider } from '../context/BreadcrumbsProvider.jsx';

/**
 * Helpers de test que **sí** dependen de React.
 *
 * Los que no lo necesitan (`mockFetch`, `createTestStorage`) viven en
 * `helpers.js`, para que los tests de lógica pura no tengan que cargar
 * Testing Library, el router ni los proveedores de la aplicación.
 */

/**
 * Renderiza un componente con los proveedores y el router que necesita.
 *
 * @param {import('react').ReactElement} ui
 * @param {object} [options]
 * @param {string} [options.route] Ruta inicial del `MemoryRouter`.
 * @param {string} [options.path] Patrón de ruta, si el componente usa `useParams`.
 * @param {Storage} [options.storage] Storage para la cesta.
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
