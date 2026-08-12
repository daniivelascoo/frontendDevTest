import { ProductCard } from './ProductCard.jsx';
import styles from './ProductGrid.module.css';

/**
 * Rejilla de productos.
 *
 * Es una lista (`ul`/`li`) y no un contenedor de `div`s: así un lector de
 * pantalla anuncia cuántos productos hay antes de recorrerlos.
 *
 * El máximo de cuatro columnas que pide el enunciado lo fija el CSS; el número
 * real se adapta al ancho disponible.
 *
 * @param {object} props
 * @param {Array<object>} props.products
 * @param {boolean} [props.dimmed] Atenúa la rejilla mientras se refiltra.
 */
export function ProductGrid({ products, dimmed = false }) {
  return (
    <ul className={styles.grid} data-dimmed={dimmed || undefined}>
      {products.map((product, index) => (
        <li key={product.id} className={styles.cell}>
          {/* La primera fila se carga con prioridad: son las imágenes que
              entran en el viewport inicial. */}
          <ProductCard product={product} imageLoading={index < 4 ? 'eager' : 'lazy'} />
        </li>
      ))}
    </ul>
  );
}
