import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductImage } from '../components/product/ProductImage.jsx';
import { ProductDescription } from '../components/product/ProductDescription.jsx';
import { ProductActions } from '../components/product/ProductActions.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { StatusMessage } from '../components/ui/StatusMessage.jsx';
import { useProduct } from '../hooks/useProduct.js';
import { useSetBreadcrumbs } from '../context/breadcrumbsContext.js';
import { formatProductName, formatSpecValue } from '../lib/format.js';
import styles from './ProductDetailPage.module.css';

/**
 * PDP — Product Details Page.
 *
 * Two columns, exactly as the brief describes: the image on the left and, on
 * the right, the description and the purchase actions. On narrow screens the
 * columns stack.
 */
export function ProductDetailPage() {
  const { id } = useParams();
  const { product, status, error, reload } = useProduct(id);

  const productName = formatProductName(product);
  const brand = formatSpecValue(product?.brand);
  const model = formatSpecValue(product?.model);

  useSetBreadcrumbs(
    useMemo(
      () => [
        { label: 'Inicio', to: '/' },
        { label: 'Productos', to: '/' },
        { label: productName || 'Producto' },
      ],
      [productName]
    )
  );

  const handleRetry = useCallback(() => reload({ force: true }), [reload]);

  const backLink = (
    <Link to="/" className={styles.back}>
      <span aria-hidden="true">←</span> Volver al listado de productos
    </Link>
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <div className={styles.page}>
        {backLink}
        <Spinner label="Cargando el detalle del producto…" />
      </div>
    );
  }

  if (status === 'error') {
    const notFound = error?.isNotFound;

    return (
      <div className={styles.page}>
        {backLink}
        <StatusMessage
          variant="error"
          title={notFound ? 'Producto no encontrado' : 'No se ha podido cargar el producto'}
          description={
            notFound
              ? 'El producto que buscas ya no está disponible o el enlace no es correcto.'
              : (error?.message ?? 'Ha ocurrido un error inesperado al contactar con el servidor.')
          }
          // Retrying a 404 would only repeat the same error.
          action={notFound ? undefined : { label: 'Reintentar', onClick: handleRetry }}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {backLink}

      <h1 className={styles.title}>
        {/* Same as in the card: the brand is omitted when missing, and the
            model falls back to the full name so the title is never empty. */}
        {brand && <span className={styles.brand}>{brand}</span>}
        <span className={styles.model}>{model || productName || 'Producto sin nombre'}</span>
      </h1>

      <div className={styles.columns}>
        <div className={styles.imageColumn}>
          <ProductImage
            src={product.imgUrl}
            // An empty `alt` would mark the image as decorative, which is
            // precisely the opposite of what it is here.
            alt={productName || 'Producto sin nombre'}
            variant="detail"
            loading="eager"
          />
        </div>

        <div className={styles.detailsColumn}>
          <ProductDescription product={product} />
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
