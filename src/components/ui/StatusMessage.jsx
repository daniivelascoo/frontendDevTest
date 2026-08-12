import { Button } from './Button.jsx';
import styles from './StatusMessage.module.css';

/**
 * Mensaje de estado a página completa: error, resultado vacío o información.
 *
 * Centraliza los estados "no hay nada que pintar" para que las páginas no
 * repitan el mismo bloque tres veces con matices distintos.
 *
 * @param {object} props
 * @param {'error' | 'empty' | 'info'} [props.variant]
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.description]
 * @param {{ label: string, onClick: () => void }} [props.action]
 * @param {import('react').ReactNode} [props.children] Contenido extra (enlaces, etc.).
 */
export function StatusMessage({ variant = 'info', title, description, action, children }) {
  return (
    <div
      className={`${styles.status} ${styles[variant]}`}
      // Los errores se anuncian de inmediato; el resto no interrumpe.
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <p className={styles.title}>{title}</p>

      {description && <p className={styles.description}>{description}</p>}

      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}
