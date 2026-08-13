import { useId } from 'react';
import styles from './OptionSelector.module.css';

/**
 * Selector for a purchase option (storage or colour).
 *
 * It is built on `<fieldset>` + `<input type="radio">` rather than buttons with
 * ARIA: group semantics, arrow-key navigation and form behaviour all come for
 * free, where otherwise they would have to be reimplemented by hand.
 *
 * @param {object} props
 * @param {string} props.legend Group title.
 * @param {string} props.name Name of the radio group.
 * @param {Array<{ code: number, name: string }>} props.options
 * @param {number | null} props.value Selected code.
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
