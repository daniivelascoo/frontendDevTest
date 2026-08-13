import { Link } from 'react-router-dom';
import { ProductImage } from './ProductImage.jsx';
import { formatPrice, formatProductName, formatSpecValue } from '../../lib/format.js';
import styles from './ProductCard.module.css';

/**
 * Product card in the list: image, brand, model and price.
 *
 * The whole card is a single link, not a card with a link inside. That leaves
 * one tab stop per product and avoids the classic "clicking the card does
 * nothing, clicking the title works".
 *
 * @param {object} props
 * @param {{ id: string, brand: string, model: string, price: string, imgUrl: string }} props.product
 * @param {'lazy' | 'eager'} [props.imageLoading]
 */
export function ProductCard({ product, imageLoading = 'lazy' }) {
  const { id, price, imgUrl } = product;

  // Brand and model are omitted when missing, rather than leaving an empty
  // paragraph taking up space and misaligning the cards in the row. The full
  // name covers the case where one of the two parts is missing.
  const brand = formatSpecValue(product.brand);
  const model = formatSpecValue(product.model);
  const name = formatProductName(product);

  return (
    <article className={styles.card}>
      <Link to={`/product/${id}`} className={styles.link}>
        <ProductImage
          src={imgUrl}
          alt={name || 'Producto sin nombre'}
          variant="card"
          loading={imageLoading}
        />

        <div className={styles.body}>
          {brand && <p className={styles.brand}>{brand}</p>}
          {/* The heading is always kept: it is the link's accessible name, and
              without it the card would be a link with no readable destination. */}
          <h2 className={styles.model}>{model || name || 'Producto sin nombre'}</h2>
          <p className={styles.price}>{formatPrice(price)}</p>
        </div>
      </Link>
    </article>
  );
}
