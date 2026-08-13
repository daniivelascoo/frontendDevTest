import { useId } from 'react';
import styles from './SearchBar.module.css';

/**
 * Catalogue search box.
 *
 * A controlled component with no submit button: filtering fires on every
 * keystroke, as the brief asks. The `<form>` with a neutralised `onSubmit`
 * exists only so Enter does not reload the page and so mobile browsers offer
 * the "search" key.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {number} [props.resultCount] Current results, to announce them.
 * @param {boolean} [props.disabled]
 */
export function SearchBar({ value, onChange, resultCount, disabled = false }) {
  const inputId = useId();

  const hasQuery = value.trim().length > 0;

  return (
    <form className={styles.form} role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={inputId} className={styles.label}>
        Buscar
      </label>

      <div className={styles.field}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="6.5" />
          <line x1="16" y1="16" x2="20.5" y2="20.5" />
        </svg>

        <input
          id={inputId}
          className={styles.input}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por marca o modelo"
          autoComplete="off"
          disabled={disabled}
          // The result is announced separately, in the `aria-live` region below.
          aria-describedby={`${inputId}-results`}
        />

        {hasQuery && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => onChange('')}
            aria-label="Borrar la búsqueda"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="7" y1="7" x2="17" y2="17" />
              <line x1="17" y1="7" x2="7" y2="17" />
            </svg>
          </button>
        )}
      </div>

      {/* Tells screen readers how many products remain after filtering,
          something only someone seeing the grid would otherwise notice. */}
      <p id={`${inputId}-results`} className="visually-hidden" aria-live="polite">
        {resultCount === undefined
          ? ''
          : `${resultCount} ${resultCount === 1 ? 'producto encontrado' : 'productos encontrados'}`}
      </p>
    </form>
  );
}
