import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import { CartProvider } from './context/CartProvider.jsx';
import { BreadcrumbsProvider } from './context/BreadcrumbsProvider.jsx';
import { ProductListPage } from './pages/ProductListPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/**
 * Composición de la aplicación: proveedores de estado y tabla de rutas.
 *
 * El router se monta fuera (en `main.jsx` para la aplicación y en el helper de
 * los tests para las pruebas), de modo que este componente pueda renderizarse
 * con un `MemoryRouter` sin tocar nada.
 */
export function App() {
  return (
    <CartProvider>
      <BreadcrumbsProvider>
        <ScrollToTop />

        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ProductListPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BreadcrumbsProvider>
    </CartProvider>
  );
}
