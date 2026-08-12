import { useId } from 'react';
import styles from './OptionSelector.module.css';

/**
 * Selector de una opción de compra (almacenamiento o color).
 *
 * Está construido sobre `<fieldset>` + `<input type="radio">` en lugar de
 * botones con ARIA: se obtiene gratis la semántica de grupo, la navegación con
 * flechas y el comportamiento en formularios que de otro modo habría que
 * reimplementar a mano.
 *
 * @param {object} props
 * @param {string} props.legend Título del grupo.
 * @param {string} props.name Nombre del grupo de radios.
 * @param {Array<{ code: number, name: string }>} props.options
 * @param {number | null} props.value Código seleccionado.
 * @param {(code: number) => void} props.onChange
 */
export function OptionSelector({ legend, name, options, value, onChange }) {
  const groupId = useId();

  if (options.length === 0) return null;

  const selectedOption = options.find((option) => option.code === value);

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {legend}
        {selectedOption && <span className={styles.selected}>{selectedOption.name}</span>}
      </legend>

      <div className={styles.options}>
        {options.map((option) => {
          const optionId = `${groupId}-${option.code}`;
          const isChecked = option.code === value;

          return (
            <div key={option.code} className={styles.option}>
              <input
                type="radio"
                id={optionId}
                name={`${name}-${groupId}`}
                className={styles.input}
                value={option.code}
                checked={isChecked}
                onChange={() => onChange(option.code)}
              />
              <label htmlFor={optionId} className={styles.chip}>
                {option.name}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
