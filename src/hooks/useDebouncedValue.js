import { useEffect, useState } from 'react';

/**
 * Returns `value` after a delay, restarting the wait on every change.
 *
 * The brief asks for real-time filtering, and that is what this is: the input
 * updates on every keystroke with no latency. The only thing deferred is the
 * work of recomputing the list, so 100 products are not filtered on every key.
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
