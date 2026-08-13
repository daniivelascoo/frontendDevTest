import gridStyles from './ProductGrid.module.css';
import styles from './ProductGridSkeleton.module.css';

/**
 * Placeholder for the catalogue while it loads.
 *
 * It reuses the real grid so the content appears in place and there is no
 * layout shift when the skeleton is replaced by the products.
 *
 * @param {object} props
 * @param {number} [props.count] Ghost cards to draw.
 * @param {string} [props.label] Text announced during the load. The catalogue's
 *   first paint is distinguished from later batches so a screen reader knows
 *   which of the two is happening.
 */
export function ProductGridSkeleton({ count = 8, label = 'Cargando productos' }) {
  return (
    <div role="status" aria-label={label}>
      <ul className={gridStyles.grid} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className={gridStyles.cell}>
            <div className={styles.card}>
              <div className={styles.image} />
              <div className={styles.lineShort} />
              <div className={styles.lineLong} />
              <div className={styles.lineShort} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
