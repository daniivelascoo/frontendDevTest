import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Lleva el scroll al inicio al navegar a una ruta nueva.
 *
 * Una SPA no recarga el documento, así que sin esto se entraría en la ficha de
 * un producto a la misma altura de scroll que tenía el listado.
 *
 * Dos excepciones deliberadas:
 *
 *   - **Navegación hacia atrás o adelante** (`POP`): ahí el usuario espera
 *     volver justo donde estaba. Saltar arriba sería especialmente molesto con
 *     el scroll infinito del listado, que obligaría a recorrerlo otra vez.
 *   - **Cambios de query string**: el buscador la reescribe en cada pulsación,
 *     y saltar arriba en cada tecla sería peor que no hacer nada. Por eso solo
 *     se observa `pathname`.
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
