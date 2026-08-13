import { resolveStorage } from './storage.js';

/**
 * Remembers how many products were expanded in the list.
 *
 * It is the obligatory counterpart to infinite scroll: without it, entering a
 * product's detail page and going back would return the user to the first
 * batch, forcing them to redo all the scrolling. That is the classic complaint
 * about this pattern.
 *
 * `sessionStorage` is used rather than `localStorage` on purpose: a position in
 * a list matters during the visit, not a week later.
 */

const STORAGE_KEY = 'itx-list-position';

/** @returns {Storage} */
function storage() {
  return resolveStorage(typeof window === 'undefined' ? undefined : window.sessionStorage);
}

/**
 * Stores the position associated with a search term.
 *
 * @param {string} query Term the list was obtained with.
 * @param {number} count Visible items.
 */
export function saveListPosition(query, count) {
  try {
    storage().setItem(STORAGE_KEY, JSON.stringify({ query, count }));
  } catch {
    /* the position is a convenience, not a requirement */
  }
}

/**
 * Retrieves the position, but only if it belongs to the same term.
 *
 * If the user comes back with a different search, the previous position belongs
 * to another list and restoring it would show an arbitrary number of results.
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

/** Forgets the stored position. */
export function clearListPosition() {
  try {
    storage().removeItem(STORAGE_KEY);
  } catch {
    /* best-effort */
  }
}
