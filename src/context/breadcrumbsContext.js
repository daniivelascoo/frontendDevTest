import { createContext, useContext, useEffect, useMemo } from 'react';

/**
 * @typedef {object} Crumb
 * @property {string} label Visible text.
 * @property {string} [to] Destination; when omitted, the crumb is the current page.
 */

/** @type {import('react').Context<{ trail: Crumb[], setTrail: (trail: Crumb[]) => void } | null>} */
export const BreadcrumbsContext = createContext(null);

/**
 * Reads the current breadcrumb trail. Consumed by the header.
 *
 * Outside the provider it returns an empty trail instead of throwing: missing
 * breadcrumbs must not stop an isolated component from rendering in a test.
 *
 * @returns {Crumb[]}
 */
export function useBreadcrumbs() {
  return useContext(BreadcrumbsContext)?.trail ?? [];
}

/**
 * Publishes the breadcrumb trail of the current page.
 *
 * Inverting control this way — the page declares where it is, the header paints
 * it — saves the header from having to know the routes or re-request the
 * product just to learn its name.
 *
 * @param {Crumb[]} trail
 */
export function useSetBreadcrumbs(trail) {
  const context = useContext(BreadcrumbsContext);
  const setTrail = context?.setTrail;

  // The trail is usually built inline, so it is compared by value rather than
  // by reference to avoid rescheduling the effect on every render.
  const serializedTrail = JSON.stringify(trail);

  const stableTrail = useMemo(() => JSON.parse(serializedTrail), [serializedTrail]);

  useEffect(() => {
    if (!setTrail) return undefined;

    setTrail(stableTrail);
    return () => setTrail([]);
  }, [setTrail, stableTrail]);
}
