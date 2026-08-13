import styles from './Spinner.module.css';

/**
 * Loading indicator.
 *
 * It is announced with `role="status"`, so a screen reader reports that a load
 * is in progress instead of running into an empty region.
 *
 * @param {object} props
 * @param {string} [props.label] Text announced during the load.
 */
export function Spinner({ label = 'Cargando…' }) {
  return (
    <div className={styles.wrapper} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
