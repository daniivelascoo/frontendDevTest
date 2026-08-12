import styles from './Button.module.css';

/**
 * Botón de la aplicación.
 *
 * @param {object} props
 * @param {'primary' | 'secondary'} [props.variant]
 * @param {boolean} [props.fullWidth]
 * @param {boolean} [props.loading] Muestra el estado ocupado y bloquea el clic.
 * @param {import('react').ReactNode} props.children
 */
export function Button({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classNames = [styles.button, styles[variant], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      // Se deshabilita durante la carga para impedir envíos duplicados, y
      // `aria-busy` comunica el motivo a los lectores de pantalla.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
