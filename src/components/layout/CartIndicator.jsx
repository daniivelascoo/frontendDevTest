import { useCart } from '../../context/cartContext.js';
import styles from './CartIndicator.module.css';

/**
 * Número de artículos en la cesta, visible en la cabecera de cualquier vista.
 *
 * El valor mostrado es el que devuelve el API en la respuesta de añadir, y se
 * anuncia con `aria-live` para que un lector de pantalla confirme la acción
 * sin que el foco tenga que moverse hasta la cabecera.
 */
export function CartIndicator() {
  const { count } = useCart();

  const label =
    count === 1 ? 'Cesta de la compra: 1 artículo' : `Cesta de la compra: ${count} artículos`;

  return (
    <div className={styles.cart} aria-live="polite" aria-atomic="true">
      <span className={styles.label} aria-hidden="true">
        Cesta
      </span>

      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5.5 7.5h13l-1.2 11a1.5 1.5 0 0 1-1.5 1.35H8.2A1.5 1.5 0 0 1 6.7 18.5z" />
        <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" />
      </svg>

      <span className={styles.count} data-testid="cart-count">
        {count}
      </span>

      <span className="visually-hidden">{label}</span>
    </div>
  );
}
