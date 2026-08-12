import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lleva el scroll al inicio al cambiar de ruta.
 *
 * Una SPA no recarga el documento, así que sin esto se entraría en la ficha de
 * un producto a la misma altura de scroll que tenía el listado.
 *
 * Solo actúa al cambiar el `pathname`: el buscador de la PLP escribe en la
 * query string en cada pulsación y saltar arriba en cada tecla sería peor que
 * no hacer nada.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
