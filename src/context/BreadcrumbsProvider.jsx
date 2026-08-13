import { useMemo, useState } from 'react';
import { BreadcrumbsContext } from './breadcrumbsContext.js';

/**
 * Stores the breadcrumb trail published by the active page.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export function BreadcrumbsProvider({ children }) {
  const [trail, setTrail] = useState([]);

  const value = useMemo(() => ({ trail, setTrail }), [trail]);

  return <BreadcrumbsContext.Provider value={value}>{children}</BreadcrumbsContext.Provider>;
}
