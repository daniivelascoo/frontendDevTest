import gridStyles from './ProductGrid.module.css';
import styles from './ProductGridSkeleton.module.css';

/**
 * Marcador de posición del catálogo mientras carga.
 *
 * Reutiliza la rejilla real para que el contenido aparezca en su sitio y no
 * haya salto de layout al sustituir el esqueleto por los productos.
 *
 * @param {object} props
 * @param {number} [props.count] Tarjetas fantasma a dibujar.
 */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div role="status" aria-label="Cargando productos">
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
