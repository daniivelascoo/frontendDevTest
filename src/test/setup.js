import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { MockIntersectionObserver } from './helpers.js';

/**
 * Configuración global de los tests.
 *
 * El objetivo es que cada test arranque de un entorno limpio: sin restos en
 * `localStorage` de un test anterior ni mocks compartidos entre archivos.
 */

// jsdom no implementa `IntersectionObserver`, del que depende el scroll
// infinito del listado. Se asigna directamente y no con `stubGlobal` para que
// el `unstubAllGlobals` de abajo no lo retire entre tests.
globalThis.IntersectionObserver = MockIntersectionObserver;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  MockIntersectionObserver.instances.length = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// jsdom no implementa `scrollTo`; sin este doble, `<ScrollToTop>` lanzaría en
// cada cambio de ruta dentro de los tests.
window.scrollTo = vi.fn();

// jsdom tampoco implementa `matchMedia`, que consumen algunas utilidades de
// media queries.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}
