import { Button } from '../ui/Button.jsx';
import styles from './LoadMore.module.css';

/**
 * Pie del listado: centinela del scroll infinito, control manual y progreso.
 *
 * El centinela es un elemento vacío que el `IntersectionObserver` vigila; el
 * botón hace lo mismo pero de forma explícita. Tener los dos no es
 * redundante: el scroll infinito solo funciona para quien hace scroll, y sin
 * un control real que enfocar, quien navega con teclado se queda sin forma de
 * ver el resto del catálogo.
 *
 * @param {object} props
 * @param {number} props.visibleCount
 * @param {number} props.totalCount
 * @param {boolean} props.hasMore
 * @param {() => void} props.onLoadMore
 * @param {import('react').RefObject<HTMLElement>} props.sentinelRef
 */
export function LoadMore({ visibleCount, totalCount, hasMore, onLoadMore, sentinelRef }) {
  return (
    <div className={styles.wrapper}>
      {/* El progreso se anuncia al cargar cada tanda: quien no ve la pantalla
          no percibiría de otro modo que han aparecido más productos. */}
      <p className={styles.progress} role="status" aria-live="polite">
        Mostrando {visibleCount} de {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
      </p>

      {hasMore && (
        <>
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

          <Button variant="secondary" onClick={onLoadMore}>
            Cargar más productos
          </Button>
        </>
      )}

      {!hasMore && totalCount > 0 && (
        <p className={styles.end}>Has llegado al final del catálogo.</p>
      )}
    </div>
  );
}
