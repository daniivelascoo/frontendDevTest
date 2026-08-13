import { Button } from './Button.jsx';
import styles from './StatusMessage.module.css';

/**
 * Full-page status message: error, empty result or information.
 *
 * It centralises the "nothing to paint" states so pages do not repeat the same
 * block three times with slightly different nuances.
 *
 * @param {object} props
 * @param {'error' | 'empty' | 'info'} [props.variant]
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.description]
 * @param {{ label: string, onClick: () => void }} [props.action]
 * @param {import('react').ReactNode} [props.children] Extra content (links, etc.).
 */
export function StatusMessage({ variant = 'info', title, description, action, children }) {
  return (
    <div
      className={`${styles.status} ${styles[variant]}`}
      // Errors are announced immediately; everything else does not interrupt.
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
