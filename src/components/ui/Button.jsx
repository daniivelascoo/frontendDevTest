import styles from './Button.module.css';

/**
 * Application button.
 *
 * @param {object} props
 * @param {'primary' | 'secondary'} [props.variant]
 * @param {boolean} [props.fullWidth]
 * @param {boolean} [props.loading] Shows the busy state and blocks clicks.
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
      // Disabled during the load to prevent duplicate submissions, with
      // `aria-busy` conveying the reason to screen readers.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
