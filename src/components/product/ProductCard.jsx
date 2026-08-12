import { Link } from 'react-router-dom';
import { ProductImage } from './ProductImage.jsx';
import { formatPrice, formatProductName, formatSpecValue } from '../../lib/format.js';
import styles from './ProductCard.module.css';

/**
 * Tarjeta de producto del listado: imagen, marca, modelo y precio.
 *
 * Toda la tarjeta es un único enlace, no una tarjeta con un enlace dentro.
 * Eso deja un solo tabulador por producto y evita el clásico "clic en la
 * tarjeta no hace nada, clic en el título sí".
 *
 * @param {object} props
 * @param {{ id: string, brand: string, model: string, price: string, imgUrl: string }} props.product
 * @param {'lazy' | 'eager'} [props.imageLoading]
 */
export function ProductCard({ product, imageLoading = 'lazy' }) {
  const { id, price, imgUrl } = product;

  // La marca y el modelo se omiten si no vienen, en lugar de dejar un párrafo
  // vacío ocupando su hueco y desalineando las tarjetas de la fila. El nombre
  // completo cubre el caso de que falte una de las dos partes.
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
          {/* El encabezado se mantiene siempre: es el nombre accesible del
              enlace y sin él la tarjeta sería un enlace sin destino legible. */}
          <h2 className={styles.model}>{model || name || 'Producto sin nombre'}</h2>
          <p className={styles.price}>{formatPrice(price)}</p>
        </div>
      </Link>
    </article>
  );
}
