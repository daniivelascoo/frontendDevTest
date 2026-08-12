import { useMemo, useState } from 'react';
import { BreadcrumbsContext } from './breadcrumbsContext.js';

/**
 * Almacena el rastro de migas que publica la página activa.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
export function BreadcrumbsProvider({ children }) {
  const [trail, setTrail] = useState([]);

  const value = useMemo(() => ({ trail, setTrail }), [trail]);

  return <BreadcrumbsContext.Provider value={value}>{children}</BreadcrumbsContext.Provider>;
}
