import styles from './Spinner.module.css';

/**
 * Indicador de carga.
 *
 * Se anuncia con `role="status"`, de modo que un lector de pantalla informe de
 * que hay una carga en curso en lugar de encontrarse una región vacía.
 *
 * @param {object} props
 * @param {string} [props.label] Texto anunciado durante la carga.
 */
export function Spinner({ label = 'Cargando…' }) {
  return (
    <div className={styles.wrapper} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
