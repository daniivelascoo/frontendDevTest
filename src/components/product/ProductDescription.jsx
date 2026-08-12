import { getAdditionalSpecGroups, getRequiredSpecs } from '../../lib/productSpecs.js';
import { MISSING_VALUE } from '../../lib/format.js';
import styles from './ProductDescription.module.css';

/**
 * Ficha técnica del producto.
 *
 * Se usan listas de definición (`dl`/`dt`/`dd`) porque eso es exactamente lo
 * que son estos datos: pares etiqueta-valor. Un lector de pantalla los asocia
 * automáticamente, sin necesidad de atributos ARIA.
 *
 * @param {object} props
 * @param {object} props.product Detalle de producto del API.
 */
export function ProductDescription({ product }) {
  const requiredSpecs = getRequiredSpecs(product);
  const additionalGroups = getAdditionalSpecGroups(product);

  return (
    <section className={styles.description} aria-labelledby="descripcion-titulo">
      <h2 id="descripcion-titulo" className={styles.sectionTitle}>
        Descripción
      </h2>

      <dl className={styles.specs}>
        {requiredSpecs.map((spec) => {
          const isMissing = spec.value === MISSING_VALUE;

          return (
            <div key={spec.id} className={styles.row}>
              <dt className={styles.label}>{spec.label}</dt>
              <dd className={styles.value} data-missing={isMissing || undefined}>
                {spec.value}
                {/* El guion se distingue a simple vista por el color, pero un
                    lector de pantalla leería solo "menos". */}
                {isMissing && <span className="visually-hidden">Dato no disponible</span>}
              </dd>
            </div>
          );
        })}
      </dl>

      {additionalGroups.length > 0 && (
        <details className={styles.more}>
          <summary className={styles.summary}>Ver especificaciones completas</summary>

          <div className={styles.groups}>
            {additionalGroups.map((group) => (
              <div key={group.id} className={styles.group}>
                <h3 className={styles.groupTitle}>{group.title}</h3>

                <dl className={styles.specs}>
                  {group.specs.map((spec) => (
                    <div key={spec.id} className={styles.row}>
                      <dt className={styles.label}>{spec.label}</dt>
                      <dd className={styles.value}>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
