import { useEffect, useState } from 'react';

/**
 * Devuelve `value` con un retardo, reiniciando la espera en cada cambio.
 *
 * El enunciado pide filtrado en tiempo real, y así es: el input se actualiza
 * en cada pulsación sin latencia. Lo que se retrasa es únicamente el trabajo
 * de recalcular la lista, para no filtrar 100 productos en cada tecla.
 *
 * @template T
 * @param {T} value
 * @param {number} [delayMs]
 * @returns {T}
 */
export function useDebouncedValue(value, delayMs = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value);
      return undefined;
    }

    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
