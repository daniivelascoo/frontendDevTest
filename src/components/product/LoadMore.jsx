import { Button } from '../ui/Button.jsx';
import { ProductGridSkeleton } from './ProductGridSkeleton.jsx';
import styles from './LoadMore.module.css';

/**
 * Footer of the list: infinite-scroll sentinel, manual control and progress.
 *
 * The sentinel is an empty element the `IntersectionObserver` watches; the
 * button does the same thing explicitly. Having both is not redundant:
 * infinite scroll only works for people who scroll, and without a real control
 * to focus, keyboard users have no way to see the rest of the catalogue.
 *
 * @param {object} props
 * @param {number} props.visibleCount
 * @param {number} props.totalCount
 * @param {boolean} props.hasMore
 * @param {boolean} props.isLoading A batch is on its way.
 * @param {() => void} props.onLoadMore
 * @param {import('react').RefObject<HTMLElement>} props.sentinelRef
 */
export function LoadMore({
  visibleCount,
  totalCount,
  hasMore,
  isLoading,
  onLoadMore,
  sentinelRef,
}) {
  return (
    <div className={styles.wrapper}>
      {/* Ghost cards for the incoming batch. They hold the space the products
          are about to occupy, so the list's growth is anticipated rather than
          jumping. */}
      {isLoading && (
        <div className={styles.incoming}>
          <ProductGridSkeleton count={4} label="Cargando más productos" />
        </div>
      )}

      {/* Progress is announced on every batch: someone who cannot see the
          screen would otherwise not notice that more products appeared. */}
      <p className={styles.progress} role="status" aria-live="polite">
        Mostrando {visibleCount} de {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
      </p>

      {hasMore && (
        <>
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

          {/* The button stays mounted during the load instead of being
              replaced by a spinner: if it disappeared, someone who had just
              pressed it with the keyboard would lose focus. */}
          <Button variant="secondary" onClick={onLoadMore} loading={isLoading}>
            {isLoading ? 'Cargando…' : 'Cargar más productos'}
          </Button>
        </>
      )}

      {!hasMore && totalCount > 0 && (
        <p className={styles.end}>Has llegado al final del catálogo.</p>
      )}
    </div>
  );
}
