import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import { CartProvider } from './context/CartProvider.jsx';
import { BreadcrumbsProvider } from './context/BreadcrumbsProvider.jsx';
import { ProductListPage } from './pages/ProductListPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/**
 * Application composition: state providers and the routing table.
 *
 * The router is mounted outside (in `main.jsx` for the application, and in the
 * test helper for the tests), so this component can be rendered with a
 * `MemoryRouter` without changing anything.
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
