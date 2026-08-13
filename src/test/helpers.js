/**
 * Test helpers that do **not** depend on React.
 *
 * They are deliberately separate from `utils.jsx`: pure-logic tests
 * (`lib/cache.test.js`, `api/products.test.js`) only need a `fetch` double and
 * an in-memory `Storage`, and have no reason to drag in Testing Library, the
 * router or the application providers.
 *
 * Anything that needs to render components lives in `utils.jsx`.
 */

/**
 * Replaces `fetch` with a double that responds based on the requested URL.
 *
 * The global `fetch` is stubbed rather than the service module on purpose: that
 * way tests exercise the real HTTP client and the real cache, which is where
 * the business rules worth verifying live.
 *
 * The **first** matching route wins, so declare the more specific ones first
 * (`/api/cart` before `/api/product`).
 *
 * @param {Array<{ match: string | RegExp, status?: number, body?: unknown, delayMs?: number }>} routes
 * @returns {import('vitest').Mock}
 */
export function mockFetch(routes) {
  const fetchMock = vi.fn(async (url) => {
    const requestUrl = String(url);

    const route = routes.find(({ match }) =>
      typeof match === 'string' ? requestUrl.includes(match) : match.test(requestUrl)
    );

    if (!route) {
      throw new Error(`No stubbed response for URL: ${requestUrl}`);
    }

    if (route.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, route.delayMs));
    }

    const status = route.status ?? 200;

    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (route.body === undefined ? '' : JSON.stringify(route.body)),
    };
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Double for `IntersectionObserver`, which jsdom does not implement.
 *
 * It records its instances so a test can simulate the infinite-scroll sentinel
 * entering the viewport, instead of settling for testing only the "load more"
 * button.
 */
export class MockIntersectionObserver {
  /** @type {MockIntersectionObserver[]} */
  static instances = [];

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
    MockIntersectionObserver.instances.push(this);
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    const index = MockIntersectionObserver.instances.indexOf(this);
    if (index !== -1) MockIntersectionObserver.instances.splice(index, 1);
  }
}

/**
 * Simulates the observed elements entering the viewport.
 *
 * @param {boolean} [isIntersecting]
 */
export function triggerIntersection(isIntersecting = true) {
  // The list is copied: the callback can trigger a render that disconnects
  // observers and mutates the array while it is being walked.
  for (const observer of [...MockIntersectionObserver.instances]) {
    const entries = [...observer.elements].map((target) => ({ target, isIntersecting }));
    if (entries.length > 0) observer.callback(entries, observer);
  }
}

/**
 * Isolated in-memory storage for a single test.
 *
 * @returns {Storage}
 */
export function createTestStorage() {
  const entries = new Map();

  return {
    get length() {
      return entries.size;
    },
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => (entries.has(key) ? entries.get(key) : null),
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
    clear: () => entries.clear(),
  };
}
