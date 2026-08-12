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

/** Parámetro de la URL que guarda el criterio de búsqueda. */
const QUERY_PARAM = 'q';

/** Productos por tanda del scroll infinito. */
const PAGE_SIZE = 12;

/**
 * PLP — Product List Page.
 *
 * El criterio de búsqueda vive en la URL y no en el estado del componente.
 * Así una búsqueda es compartible, sobrevive al recargar y —lo que más se
 * nota al usarlo— sigue ahí al volver desde la ficha de un producto.
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
        // Se reemplaza la entrada del historial: escribir en el buscador no
        // debe llenar el historial de un paso por cada tecla.
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const { products, allProducts, status, error, isLoading, isFiltering, reload } =
    useProducts(query);

  // Posición guardada al entrar en una ficha, para no devolver al usuario a la
  // primera tanda al volver atrás. Se lee una sola vez, al montar.
  const restoredCount = useRef(readListPosition(query));

  const { visibleItems, visibleCount, totalCount, hasMore, loadMore, sentinelRef } =
    useInfiniteScroll(products, {
      pageSize: PAGE_SIZE,
      resetKey: query.trim(),
      initialCount: restoredCount.current ?? undefined,
    });

  useEffect(() => {
    // Mientras el catálogo carga no hay nada visible, y guardar ese cero
    // borraría la posición que acabamos de restaurar.
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
            onLoadMore={loadMore}
            sentinelRef={sentinelRef}
          />
        </>
      )}
    </div>
  );
}
