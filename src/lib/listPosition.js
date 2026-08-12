import { resolveStorage } from './storage.js';

/**
 * Recuerda cuántos productos había desplegados en el listado.
 *
 * Es la contrapartida obligada del scroll infinito: sin esto, entrar en la
 * ficha de un producto y volver atrás devolvería al usuario a la primera tanda,
 * obligándole a repetir todo el scroll. Es la queja clásica de este patrón.
 *
 * Se usa `sessionStorage` y no `localStorage` a propósito: la posición en un
 * listado interesa durante la visita, no una semana después.
 */

const STORAGE_KEY = 'itx-list-position';

/** @returns {Storage} */
function storage() {
  return resolveStorage(typeof window === 'undefined' ? undefined : window.sessionStorage);
}

/**
 * Guarda la posición asociada a un criterio de búsqueda.
 *
 * @param {string} query Criterio con el que se obtuvo esa lista.
 * @param {number} count Elementos visibles.
 */
export function saveListPosition(query, count) {
  try {
    storage().setItem(STORAGE_KEY, JSON.stringify({ query, count }));
  } catch {
    /* la posición es una comodidad, no un requisito */
  }
}

/**
 * Recupera la posición, pero solo si corresponde al mismo criterio.
 *
 * Si el usuario vuelve con otra búsqueda, la posición anterior es de otra
 * lista y restaurarla mostraría un número arbitrario de resultados.
 *
 * @param {string} query
 * @returns {number | null}
 */
export function readListPosition(query) {
  try {
    const raw = storage().getItem(STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    if (!saved || saved.query !== query) return null;

    const count = Number(saved.count);
    return Number.isFinite(count) && count > 0 ? count : null;
  } catch {
    return null;
  }
}

/** Olvida la posición guardada. */
export function clearListPosition() {
  try {
    storage().removeItem(STORAGE_KEY);
  } catch {
    /* best-effort */
  }
}
