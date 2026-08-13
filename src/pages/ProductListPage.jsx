import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/product/SearchBar.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { ProductGridSkeleton } from '../components/product/ProductGridSkeleton.jsx';
import { LoadMore } from '../components/product/LoadMore.jsx';
import { StatusMessage } from '../components/ui/StatusMessage.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';
import { useSetBreadcrumbs } from '../context/breadcrumbsContext.js';
import { invalidateProductCache } from '../api/products.js';
import { readListPosition, saveListPosition } from '../lib/listPosition.js';
import styles from './ProductListPage.module.css';

/** URL parameter holding the search term. */
const QUERY_PARAM = 'q';

/** Products per infinite-scroll batch. */
const PAGE_SIZE = 12;

/**
 * PLP — Product List Page.
 *
 * The search term lives in the URL rather than in component state. That makes a
 * search shareable, lets it survive a reload and — the part you notice most in
 * use — keeps it there when coming back from a product detail page.
 */
export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';

  const handleQueryChange = useCallback(
    (nextQuery) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (nextQuery) next.set(QUERY_PARAM, nextQuery);
          else next.delete(QUERY_PARAM);
          return next;
        },
        // The history entry is replaced: typing in the search box must not
        // fill the history with one step per keystroke.
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const { products, allProducts, status, error, isLoading, isFiltering, reload } =
    useProducts(query);

  // Position stored when entering a detail page, so going back does not return
  // the user to the first batch. Read once, on mount.
  const restoredCount = useRef(readListPosition(query));

  const { visibleItems, visibleCount, totalCount, hasMore, isLoadingMore, loadMore, sentinelRef } =
    useInfiniteScroll(products, {
      pageSize: PAGE_SIZE,
      resetKey: query.trim(),
      initialCount: restoredCount.current ?? undefined,
    });

  useEffect(() => {
    // While the catalogue loads nothing is visible, and storing that zero
    // would wipe the position we have just restored.
    if (visibleCount > 0) saveListPosition(query, visibleCount);
  }, [query, visibleCount]);

  useSetBreadcrumbs(useMemo(() => [{ label: 'Inicio', to: '/' }, { label: 'Productos' }], []));

  const handleRetry = useCallback(() => {
    invalidateProductCache();
    reload({ force: true });
  }, [reload]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Dispositivos móviles</h1>
          <p className={styles.subtitle}>
            {status === 'success'
              ? `${products.length} de ${allProducts.length} ${
                  allProducts.length === 1 ? 'producto' : 'productos'
                }`
              : 'Catálogo completo'}
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={handleQueryChange}
          resultCount={status === 'success' ? products.length : undefined}
          disabled={status === 'error'}
        />
      </div>

      {isLoading && <ProductGridSkeleton />}

      {status === 'error' && (
        <StatusMessage
          variant="error"
          title="No se ha podido cargar el catálogo"
          description={
            error?.message ??
            'Ha ocurrido un error inesperado al contactar con el servidor. Inténtalo de nuevo.'
          }
          action={{ label: 'Reintentar', onClick: handleRetry }}
        />
      )}

      {status === 'success' && products.length === 0 && (
        <StatusMessage
          variant="empty"
          title={`Sin resultados para «${query.trim()}»`}
          description="Revisa la ortografía o prueba con otra marca o modelo."
          action={{ label: 'Borrar la búsqueda', onClick: () => handleQueryChange('') }}
        />
      )}

      {status === 'success' && products.length > 0 && (
        <>
          <ProductGrid products={visibleItems} dimmed={isFiltering} />

          <LoadMore
            visibleCount={visibleCount}
            totalCount={totalCount}
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={loadMore}
            sentinelRef={sentinelRef}
          />
        </>
      )}
    </div>
  );
}
