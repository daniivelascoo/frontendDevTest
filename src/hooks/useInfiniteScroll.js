import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Muestra una lista por tandas, ampliándola al llegar el usuario al final.
 *
 * El API devuelve los 100 productos de una vez y no admite parámetros de
 * paginado, así que aquí no se carga nada: solo se decide cuántos elementos de
 * los que ya están en memoria se renderizan. Eso evita montar 100 tarjetas —y
 * sus 100 imágenes— en la primera pintura.
 *
 * Se expone `loadMore` además del centinela porque el scroll infinito por sí
 * solo excluye a quien navega con teclado: sin un control real que enfocar, no
 * hay forma de pedir la siguiente tanda. La página monta ambos.
 *
 * @template T
 * @param {T[]} items Lista completa, ya filtrada.
 * @param {object} [options]
 * @param {number} [options.pageSize] Elementos por tanda.
 * @param {string} [options.resetKey] Al cambiar, se vuelve a la primera tanda.
 * @param {number} [options.initialCount] Elementos visibles al montar.
 * @returns {{
 *   visibleItems: T[],
 *   visibleCount: number,
 *   totalCount: number,
 *   hasMore: boolean,
 *   loadMore: () => void,
 *   sentinelRef: import('react').RefObject<HTMLElement>
 * }}
 */
export function useInfiniteScroll(items, { pageSize = 12, resetKey = '', initialCount } = {}) {
  const totalCount = items.length;

  // No se acota contra `totalCount`: al montar, la lista todavía está vacía
  // porque los datos no han llegado, así que acotar aquí reduciría siempre la
  // posición restaurada a una sola tanda. El recorte real lo hace el `slice`,
  // que nunca devuelve más elementos de los que hay.
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.max(initialCount ?? pageSize, pageSize)
  );

  const sentinelRef = useRef(null);
  const isFirstRender = useRef(true);

  // Al cambiar el criterio de búsqueda, la lista es otra: seguir en la tanda
  // quinta de una lista que ahora tiene tres elementos no tendría sentido.
  useEffect(() => {
    // En el primer render no: pisaría el `initialCount` con el que la página
    // restaura la posición al volver desde la ficha de un producto.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  const hasMore = visibleCount < totalCount;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, totalCount));
  }, [pageSize, totalCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    // Sin centinela, sin más elementos que mostrar o sin soporte del
    // navegador, el botón «Cargar más» sigue estando disponible.
    if (!sentinel || !hasMore || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      // Se anticipa media pantalla para que la siguiente tanda esté lista
      // antes de que el usuario llegue al vacío.
      { rootMargin: '50% 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return {
    visibleItems,
    visibleCount: visibleItems.length,
    totalCount,
    hasMore,
    loadMore,
    sentinelRef,
  };
}
