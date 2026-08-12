import { useId } from 'react';
import styles from './SearchBar.module.css';

/**
 * Buscador del catálogo.
 *
 * Es un componente controlado y sin botón de envío: el filtrado se dispara en
 * cada pulsación, como pide el enunciado. El `<form>` con `onSubmit`
 * neutralizado existe solo para que Enter no recargue la página y para que los
 * navegadores móviles ofrezcan la tecla "buscar".
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {number} [props.resultCount] Resultados actuales, para anunciarlos.
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
          // El resultado se anuncia aparte, en la región `aria-live` de abajo.
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

      {/* Comunica a los lectores de pantalla cuántos productos quedan tras
          filtrar, algo que de otro modo solo percibiría quien ve el grid. */}
      <p id={`${inputId}-results`} className="visually-hidden" aria-live="polite">
        {resultCount === undefined
          ? ''
          : `${resultCount} ${resultCount === 1 ? 'producto encontrado' : 'productos encontrados'}`}
      </p>
    </form>
  );
}
