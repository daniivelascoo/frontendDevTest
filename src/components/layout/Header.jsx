import { Link } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { CartIndicator } from './CartIndicator.jsx';
import styles from './Header.module.css';

/**
 * Cabecera de la aplicación, presente en ambas vistas.
 *
 * Reúne los tres elementos que pide el enunciado: el título como enlace a la
 * vista principal, las migas de pan de la página actual y el contador de la
 * cesta a la derecha.
 */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <Link to="/" className={styles.brand} aria-label="Mobile Store, ir a la página principal">
            <svg
              className={styles.brandIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="7" y="2.5" width="10" height="19" rx="2" />
              <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" strokeLinecap="round" />
            </svg>
            <span className={styles.brandName}>Mobile Store</span>
          </Link>

          <CartIndicator />
        </div>

        <Breadcrumbs />
      </div>
    </header>
  );
}
