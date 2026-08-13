import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../../context/breadcrumbsContext.js';
import styles from './Breadcrumbs.module.css';

/**
 * Breadcrumbs in the header.
 *
 * The last crumb is the current page: it is marked with `aria-current` and is
 * never a link, because linking to the page you are already on adds nothing for
 * someone navigating with a keyboard or a screen reader.
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
