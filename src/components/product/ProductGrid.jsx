import { ProductCard } from './ProductCard.jsx';
import styles from './ProductGrid.module.css';

/**
 * Product grid.
 *
 * It is a list (`ul`/`li`) rather than a container of `div`s, so a screen
 * reader announces how many products there are before walking through them.
 *
 * The four-column maximum the brief asks for is set in CSS; the actual number
 * adapts to the available width.
 *
 * @param {object} props
 * @param {Array<object>} props.products
 * @param {boolean} [props.dimmed] Dims the grid while it is being refiltered.
 */
export function ProductGrid({ products, dimmed = false }) {
  return (
    <ul className={styles.grid} data-dimmed={dimmed || undefined}>
      {products.map((product, index) => (
        <li key={product.id} className={styles.cell}>
          {/* The first row loads with priority: those are the images that fall
              inside the initial viewport. */}
          <ProductCard product={product} imageLoading={index < 4 ? 'eager' : 'lazy'} />
        </li>
      ))}
    </ul>
  );
}
