import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { MockIntersectionObserver } from './helpers.js';

/**
 * Global test configuration.
 *
 * The goal is for every test to start from a clean environment: no leftovers in
 * `localStorage` from a previous test and no mocks shared between files.
 */

// jsdom does not implement `IntersectionObserver`, which the list's infinite
// scroll depends on. It is assigned directly rather than through `stubGlobal`
// so that the `unstubAllGlobals` below does not remove it between tests.
globalThis.IntersectionObserver = MockIntersectionObserver;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  MockIntersectionObserver.instances.length = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// jsdom does not implement `scrollTo`; without this double, `<ScrollToTop>`
// would throw on every route change inside the tests.
window.scrollTo = vi.fn();

// jsdom does not implement `matchMedia` either, which some media-query
// utilities consume.
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
