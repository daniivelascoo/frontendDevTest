/**
 * Sanitising of image URLs coming from the API.
 *
 * React escapes text but does **not** validate the `src` attribute: whatever the
 * server returns gets painted as-is. A `javascript:` URL in an `<img>` does not
 * actually execute in current browsers, so this does not close an XSS; what it
 * prevents is the catalogue pointing the visitor's browser at schemes that are
 * never a legitimate image (`data:`, `blob:`, `file:`).
 *
 * The other half of the policy — which hosts images are accepted from — lives in
 * the CSP in `vite.config.js`, which is its natural place: that way the API host
 * is not duplicated in the code, and `lib/` need not know the API configuration.
 */

/** Schemes a catalogue image could reasonably arrive with. */
const SAFE_PROTOCOLS = new Set(['https:', 'http:']);

/**
 * Synthetic base used to resolve relative paths (`/images/x.jpg`), which carry
 * no protocol of their own and inherit the page's. It is used for nothing else:
 * only the resulting protocol matters.
 */
const RELATIVE_BASE = 'https://localhost';

/**
 * Checks that an image URL uses an acceptable scheme.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isSafeImageUrl(value) {
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    // The `URL` constructor normalises before exposing the protocol, so it also
    // catches schemes obfuscated with tabs or line breaks ("java\nscript:"),
    // which a `startsWith` check would let through.
    const { protocol } = new URL(trimmed, RELATIVE_BASE);
    return SAFE_PROTOCOLS.has(protocol);
  } catch {
    return false;
  }
}

/**
 * Returns the URL ready to paint, or an empty string if it is not usable.
 *
 * It is trimmed before deciding: a whitespace-only URL is truthy, and painting
 * it would make the browser request the page itself as an image before ending up
 * showing the fallback anyway.
 *
 * @param {unknown} value
 * @returns {string} The URL, or `''` so the caller shows its fallback.
 */
export function sanitizeImageUrl(value) {
  return isSafeImageUrl(value) ? value.trim() : '';
}
