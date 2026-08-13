import { useState } from 'react';
import { sanitizeImageUrl } from '../../lib/imageUrl.js';
import styles from './ProductImage.module.css';

/**
 * Product image with a placeholder and a fallback on error.
 *
 * Some catalogue images do not exist on the server, so a bare `<img>` would
 * leave the broken-image icon. Here the failure becomes a neutral placeholder
 * that keeps the space and does not disturb the layout.
 *
 * @param {object} props
 * @param {string} [props.src]
 * @param {string} props.alt
 * @param {'card' | 'detail'} [props.variant]
 * @param {'lazy' | 'eager'} [props.loading]
 */
export function ProductImage({ src, alt, variant = 'card', loading = 'lazy' }) {
  // The single point where the API's `src` reaches an `<img>`: both the list
  // card and the detail page paint their image through this component, so
  // sanitising here is enough. Anything failing validation falls back to the
  // same placeholder that already covers broken images.
  const url = sanitizeImageUrl(src);

  const [state, setState] = useState(url ? 'loading' : 'error');
  const [renderedSrc, setRenderedSrc] = useState(url);

  // When the image changes, the state is reset during the render itself rather
  // than in an effect: that way no frame is ever painted carrying the previous
  // image's state.
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
