import { getAdditionalSpecGroups, getRequiredSpecs } from '../../lib/productSpecs.js';
import { MISSING_VALUE } from '../../lib/format.js';
import styles from './ProductDescription.module.css';

/**
 * Product spec sheet.
 *
 * Definition lists (`dl`/`dt`/`dd`) are used because that is exactly what this
 * data is: label-value pairs. A screen reader associates them automatically,
 * with no need for ARIA attributes.
 *
 * @param {object} props
 * @param {object} props.product Product detail from the API.
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
                {/* The dash is distinguishable at a glance by its colour, but a
                    screen reader would read just "minus". */}
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
