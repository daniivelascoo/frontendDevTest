---
name: testing-rtl
description: How to write tests in this project with Vitest and Testing Library — available helpers, API stubbing, fixtures and what is worth testing. Use it when adding or fixing any .test.js/.test.jsx file.
---

# Tests

Vitest + Testing Library on jsdom. `globals: true`, so `describe`, `it`, `expect`
and `vi` are available without importing them.

## What to test

Test **behaviour the user can observe**, not implementation details. A test that
breaks when an internal state variable is renamed, without the application
having changed behaviour, is a badly framed test.

Priority in this project:

1. The requirements from the brief (see the `spec-itx` skill). Each one should
   have a test that reads like the requirement.
2. The cache and its one-hour expiry.
3. The search filtering.
4. Error and empty-list states, the ones people forget and the ones the reviewer
   will try by hand.

Do not chase 100% coverage. One test per branch of `formatSpecValue` adds
nothing; one checking that a product without a price does not show "0 €" does.

## Available helpers

They are split across two files depending on whether they need React. Import
from the right one: a pure-logic test should not load Testing Library.

**`src/test/helpers.js`** — no React:

- `mockFetch(routes)` — replaces global `fetch`. Each route is
  `{ match, status?, body?, delayMs? }`, where `match` is a URL fragment or a
  regular expression. **First match wins**, so put the more specific routes
  first (`/api/cart` before `/api/product`, and `/api/product/` with a trailing
  slash to hit the detail endpoint rather than the list).
- `createTestStorage()` — in-memory `Storage`, isolated per test.
- `MockIntersectionObserver` + `triggerIntersection()` — jsdom implements no
  `IntersectionObserver`, which the infinite scroll depends on.

**`src/test/utils.jsx`** — with React:

- `renderWithProviders(ui, { route, path, storage })` — mounts with
  `MemoryRouter`, `CartProvider` and `BreadcrumbsProvider`, and returns a
  `userEvent` instance ready to use. Use `path` when the component reads
  `useParams`, and `storage` to preload the cart counter.
- `renderApp({ route })` — mounts the whole `<App>` on a given route. Needed for
  anything living in the header (cart counter, breadcrumbs) and for the routing
  table, since `renderWithProviders` mounts a bare view with no header. `<App>`
  brings its own providers, so this helper only adds the router; the cart uses
  jsdom's `localStorage`, which the global `afterEach` clears.

If you add a helper, put it in the file it belongs to. Adding something that
imports React to `helpers.js` silently undoes the split.

`src/test/fixtures.js` holds responses copied from the real API, typos included.
Do not "fix" them: an idealised fixture makes tests pass that would fail against
the real server.

## Writing rules

- Stub `fetch`, not the `api/` modules. That way tests exercise the real HTTP
  client and the real cache, which is where the logic that matters lives.
- Call `invalidateProductCache()` in the `beforeEach` of any test touching
  products: the cache is a module singleton and would leak between tests.
- Query by role and accessible name (`getByRole('radio', { name: '32 GB' })`).
  Fall back to `data-testid` only when no reasonable role exists.
- Use `findBy*` or `waitFor` for anything async; never wait on a timer.
- An `it` describes one behaviour, in **English** and in the third person:
  "preselects the first option of each group". Note that the assertions
  themselves still match Spanish UI strings — those are the product.

## Known pitfalls

- **The search box is debounced by 250 ms.** After `user.type` you must wait
  with `waitFor` or `findBy*`; an immediate assertion sees the unfiltered list.
- **`isNotFound` and `isRetryable` are getters on `ApiError`'s prototype**, so
  `toMatchObject` does not see them. Capture the error and check them directly.
- **StrictMode mounts twice.** If a test counts `fetch` calls, remember that
  `api/products.js` de-duplicates in-flight requests: two simultaneous mounts
  produce **one** request, not two.
- **`Spinner` exposes no `aria-label`.** Its text sits in a visually hidden
  `span`, so `getByLabelText` will not find it — query by text, or by
  `role="status"`. The list skeleton _does_ have a label
  (`getByLabelText('Cargando productos')`).
- **`StatusMessage` renders its title as a `<p>`, not a heading.** Do not look
  for `getByRole('heading')`; assert on its role instead — `alert` for the error
  variant, `status` for the rest. That also disambiguates text that appears both
  in the message and in the breadcrumbs.
- **When navigating, a loading indicator may never mount.** The stubbed response
  can resolve before it renders, and `waitForElementToBeRemoved` requires the
  element to have existed. On navigation, wait positively for the destination
  content (`findByRole`) instead. `waitForElementToBeRemoved` is fine on the
  first mount of a view.
- **Breadcrumbs are published from an effect.** Each page sets them with
  `useSetBreadcrumbs`, so they resolve one render after the title is painted:
  use `findByText` for the last crumb.
- **The cart counter is rehydrated from storage on mount.** Preload it with the
  `CART_STORAGE_KEY` exported from `context/CartProvider.jsx`, either through
  `createTestStorage()` or `window.localStorage`.

## Commands

```bash
npm test                 # single run
npm run test:watch       # watch mode during development
npm run test:coverage    # coverage report
npx vitest run src/lib   # a single folder
```
