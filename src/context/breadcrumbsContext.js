import { createContext, useContext, useEffect, useMemo } from 'react';

/**
 * @typedef {object} Crumb
 * @property {string} label Texto visible.
 * @property {string} [to] Destino; si se omite, la miga es la página actual.
 */

/** @type {import('react').Context<{ trail: Crumb[], setTrail: (trail: Crumb[]) => void } | null>} */
export const BreadcrumbsContext = createContext(null);

/**
 * Lee el rastro de migas actual. Lo consume la cabecera.
 *
 * Fuera del provider devuelve un rastro vacío en lugar de lanzar: unas migas
 * ausentes no deben impedir que se renderice un componente aislado en un test.
 *
 * @returns {Crumb[]}
 */
export function useBreadcrumbs() {
  return useContext(BreadcrumbsContext)?.trail ?? [];
}

/**
 * Publica el rastro de migas de la página actual.
 *
 * Invertir el control así —la página declara dónde está, la cabecera lo
 * pinta— evita que la cabecera tenga que conocer las rutas ni volver a pedir
 * el producto solo para saber su nombre.
 *
 * @param {Crumb[]} trail
 */
export function useSetBreadcrumbs(trail) {
  const context = useContext(BreadcrumbsContext);
  const setTrail = context?.setTrail;

  // El rastro suele construirse en línea, así que se compara por valor y no
  // por referencia para no reprogramar el efecto en cada render.
  const serializedTrail = JSON.stringify(trail);

  const stableTrail = useMemo(() => JSON.parse(serializedTrail), [serializedTrail]);

  useEffect(() => {
    if (!setTrail) return undefined;

    setTrail(stableTrail);
    return () => setTrail([]);
  }, [setTrail, stableTrail]);
}
