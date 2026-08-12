import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../../context/breadcrumbsContext.js';
import styles from './Breadcrumbs.module.css';

/**
 * Migas de pan de la cabecera.
 *
 * La última miga es la página actual: se marca con `aria-current` y nunca es
 * un enlace, porque enlazar a la página en la que ya estás no aporta nada a
 * quien navega con teclado o lector de pantalla.
 */
export function Breadcrumbs() {
  const trail = useBreadcrumbs();

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className={styles.breadcrumbs}>
      <ol className={styles.list}>
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li key={`${crumb.label}-${index}`} className={styles.item}>
              {isLast || !crumb.to ? (
                <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className={styles.link}>
                  {crumb.label}
                </Link>
              )}

              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
