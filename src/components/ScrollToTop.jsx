import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to the top when navigating to a new route.
 *
 * An SPA does not reload the document, so without this you would land on a
 * product's detail page at the same scroll offset the list had.
 *
 * Two deliberate exceptions:
 *
 *   - **Back or forward navigation** (`POP`): there the user expects to return
 *     exactly where they were. Jumping to the top would be especially annoying
 *     with the list's infinite scroll, forcing them to scroll through it again.
 *   - **Query string changes**: the search box rewrites it on every keystroke,
 *     and jumping to the top on every key would be worse than doing nothing.
 *     That is why only `pathname` is watched.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, navigationType]);

  return null;
}
