import { useState } from 'react';
import styles from './ProductImage.module.css';

/**
 * Imagen de producto con marcador de posición y respaldo ante error.
 *
 * Algunas imágenes del catálogo no existen en el servidor, así que un `<img>`
 * pelado dejaría el icono de imagen rota. Aquí el fallo se convierte en un
 * marcador neutro que conserva el hueco y no desmonta el layout.
 *
 * @param {object} props
 * @param {string} [props.src]
 * @param {string} props.alt
 * @param {'card' | 'detail'} [props.variant]
 * @param {'lazy' | 'eager'} [props.loading]
 */
export function ProductImage({ src, alt, variant = 'card', loading = 'lazy' }) {
  // Se recorta antes de decidir: una URL de solo espacios es `truthy`, y
  // pintarla haría que el navegador pidiese la propia página como imagen
  // antes de acabar mostrando el respaldo igualmente.
  const url = typeof src === 'string' ? src.trim() : '';

  const [state, setState] = useState(url ? 'loading' : 'error');
  const [renderedSrc, setRenderedSrc] = useState(url);

  // Si cambia la imagen, se reinicia el estado durante el propio render en
  // lugar de en un efecto: así no se llega a pintar un fotograma con el
  // estado de la imagen anterior.
  if (url !== renderedSrc) {
    setRenderedSrc(url);
    setState(url ? 'loading' : 'error');
  }

  const showFallback = state === 'error';

  return (
    <div className={`${styles.frame} ${styles[variant]}`} data-state={state}>
      {!showFallback && (
        <img
          className={styles.image}
          src={url}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}

      {showFallback && (
        <div className={styles.fallback} role="img" aria-label={`${alt} (imagen no disponible)`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
            <line x1="10" y1="18.5" x2="14" y2="18.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
