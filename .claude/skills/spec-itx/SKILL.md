---
name: spec-itx
description: Verifiable requirements of the front-end technical test (PLP, PDP, header, search, purchase actions, API contract and the 1-hour cache). Use it before implementing or modifying any product view or component, and whenever you need to check whether the project still meets the brief.
---

# Requirements of the test

This skill is the translation of the brief (`Prueba frontend ITX.pdf`) into
criteria that can be checked one by one. For a question about what the
application must do, this document wins; for a question about how to write it,
`convenciones-react` wins.

Mark a requirement as met only if a test proves it or you have verified it in
the running application.

Note on language: the requirement text here is in English, but the UI strings it
quotes stay in Spanish, because that is what the application actually renders.

## Global constraints

- **SPA with client-side routing.** No MPA, no SSR. Routing is
  `react-router-dom` over `BrowserRouter`.
- **React with ES6.** The project is JavaScript, not TypeScript. Contracts are
  documented with JSDoc.
- **Four mandatory scripts**, which must not be renamed: `start` (development),
  `build` (production), `test` (tests), `lint` (static analysis).
- **Incremental delivery.** The git history must read as a sequence of
  self-contained milestones, not as a single code dump.

## PLP view — product list

| #     | Requirement                                      | Where it lives                              |
| ----- | ------------------------------------------------ | ------------------------------------------- |
| PLP-1 | Shows every item returned by `GET /api/product`  | `pages/ProductListPage.jsx`                 |
| PLP-2 | Filters by the term entered by the user          | `lib/search.js`                             |
| PLP-3 | Selecting a product navigates to its detail page | `components/product/ProductCard.jsx`        |
| PLP-4 | At most four items per row, responsive           | `components/product/ProductGrid.module.css` |

The four-column maximum is a ceiling, not a fixed number: below `64rem` the grid
drops to three, two or whatever fits. If you touch that CSS, check that a fifth
column never appears on wide screens.

### Infinite scroll

Added on top of the brief's minimum. The list renders batches of 12 and extends
as the user approaches the end (`hooks/useInfiniteScroll.js`). PLP-1 still
holds: every product from the API is there and all of them are reachable; they
just appear progressively.

Each batch arrives after a deliberate pause (`delayMs`), with ghost cards in the
meantime. The products are already in memory: the pause exists only so the user
perceives that a load happened. Remove it and the list grows all at once, with
the indicator never becoming visible.

The loading state is mirrored in a ref (`isLoadingRef`) so that `loadMore` does
not change identity during the pause. If it did, the observer effect would
resubscribe mid-wait and fire another batch.

Four pieces that belong together and should not be touched separately:

- **Sentinel + button.** `components/product/LoadMore.jsx` mounts both. The
  button is not redundant: infinite scroll only works for people who scroll, and
  without a real control to focus, keyboard users have no way to see the rest of
  the catalogue. It is also the escape hatch if the browser has no
  `IntersectionObserver`.
- **Position on return.** `lib/listPosition.js` stores in `sessionStorage` how
  many products were expanded, keyed by the search term. Without it, coming back
  from a detail page would return the user to the first 12.
- **`ScrollToTop` ignores `POP` navigations**, so the browser can restore the
  scroll position when going back. Always jumping to the top would make the
  restored position useless.

In tests, jsdom implements no `IntersectionObserver`: there is a double in
`test/helpers.js` and `triggerIntersection()` to simulate the sentinel entering
the viewport.

## PDP view — product detail

| #     | Requirement                                                      | Where it lives                       |
| ----- | ---------------------------------------------------------------- | ------------------------------------ |
| PDP-1 | Two columns: image on the left, details and actions on the right | `pages/ProductDetailPage.module.css` |
| PDP-2 | Link back to the list                                            | `pages/ProductDetailPage.jsx`        |

## Header

| #      | Requirement                                             | Where it lives                        |
| ------ | ------------------------------------------------------- | ------------------------------------- |
| HEAD-1 | The title or icon links to the main view                | `components/layout/Header.jsx`        |
| HEAD-2 | Breadcrumbs with the current page and a navigation link | `components/layout/Breadcrumbs.jsx`   |
| HEAD-3 | Cart item count, on the right and on every view         | `components/layout/CartIndicator.jsx` |

Breadcrumbs are published by each page with `useSetBreadcrumbs`; the header only
paints them. If you add a view, publish its trail or the header will be left
without breadcrumbs.

HEAD-3 is covered end to end in `src/App.test.jsx`, which mounts the whole
application: the counter is visible on both views, takes the value returned by
the API and survives navigation. `CartIndicator.test.jsx` covers its own
formatting. Note that page-level tests mount a bare view and therefore have no
header — a regression there would only show up in `App.test.jsx`.

## Search

| #        | Requirement                                              |
| -------- | -------------------------------------------------------- |
| SEARCH-1 | Free-text input                                          |
| SEARCH-2 | Compares the text against **brand** and **model**        |
| SEARCH-3 | Real-time filtering: re-runs on every change of the term |

The 250 ms debounce in `useDebouncedValue` does not break SEARCH-3: the input
updates on every keystroke and the only thing deferred is recomputing the list.
Do not turn it into a search with a submit button.

## Product card (ITEM)

Must show image, brand, model and price. No more, no less: the card is not the
place for technical specifications.

## Product description (DESCRIPTION)

The eleven mandatory attributes, in this order, are produced by
`lib/productSpecs.js` → `getRequiredSpecs()`:

brand, model, price, CPU, RAM, operating system, screen resolution, battery,
cameras, dimensions, weight.

### Handling missing data

The API omits data in several different ways — empty string, whitespace only,
`null`, missing field or empty array — and there are **two opposite rules**
depending on how important the value is:

| Kind of data                                        | Rule                                     | Where                     |
| --------------------------------------------------- | ---------------------------------------- | ------------------------- |
| Mandatory (the eleven above)                        | The row stays and the value is `-`       | `getRequiredSpecs`        |
| Secondary (inside "Ver especificaciones completas") | The whole row disappears, label included | `getAdditionalSpecGroups` |

The reason for the asymmetry: in the mandatory block, keeping the row lets you
compare two products line by line and makes it clear the attribute was looked
up. In the secondary block, twenty dashed rows would turn the page into a list
of absences. If the API has no GPU, not even the "GPU" label appears; and a
group left with no rows disappears too, so no orphan heading is left behind.

The placeholder is the `MISSING_VALUE` constant in `lib/format.js`. Do not write
`-` by hand: the UI compares against that constant to dim the value and add a
"Dato no disponible" text for screen readers, which would otherwise read just
"minus".

**The price exception.** `formatPrice` defaults to "Precio no disponible",
because the price is also shown on its own in the card and in the purchase
block, where a dash would say nothing. In the spec table, where the row is
already labelled, it is passed `{ fallback: MISSING_VALUE }`. An empty `price`
must never end up displayed as "0 €".

## Purchase actions (ACTIONS)

| #     | Requirement                                                          |
| ----- | -------------------------------------------------------------------- |
| ACT-1 | Storage selector and colour selector                                 |
| ACT-2 | With a single option, the selector still shows and comes preselected |
| ACT-3 | Add-to-cart button                                                   |
| ACT-4 | The POST sends identifier, colour code and storage code              |
| ACT-5 | The count returned by the API is shown in the header and persists    |

ACT-2 is easy to break without noticing: there are dedicated tests in
`pages/ProductDetailPage.test.jsx` using the `singleOptionProductFixture`.

### Products that cannot be bought

Added on top of the brief's minimum. A product is only buyable if it meets
**all three** conditions: it has a price, at least one storage option and at
least one colour option. If any fails, the button is disabled and an explanation
is shown naming **every** reason, not just the first.

The logic lives in `lib/availability.js` (`getPurchaseAvailability`), outside the
component so the combinations can be tested without mounting React. It returns
`{ isAvailable, reasons, message }`.

Three details worth not breaking:

- **A price of `0` is valid**: it means free, not missing. The rule is decided by
  `hasPrice` in `lib/format.js`, shared by `formatPrice` and the availability
  check — do not duplicate it.
- **An option only counts if it has both code and name.** `getPurchaseOptions`
  discards any that fails either. In the real catalogue, Acer DX650 and Acer M900
  return `storages: [{ code: 2000, name: " " }]`; accepting it because it has a
  code painted a pill with a dash and marked the product as buyable. There are
  regression tests using `blankOptionNameProductFixture`.
- **The selectors are still shown** even when the product is not buyable: the
  user must be able to see which options exist.
- The notice is linked to the button with `aria-describedby`, so a screen reader
  announces the reason on reaching it. A disabled, silent button leaves the user
  guessing.

## API contract

Domain: `https://itx-frontend-test.onrender.com`

```
GET  /api/product         → ProductSummary[]
GET  /api/product/:id     → ProductDetail
POST /api/cart            → { count: number }
     body: { id, colorCode, storageCode }
```

Real quirks of the API that must be respected and **not** "fixed" in the
fixtures:

- `dimentions` and `secondaryCmera` are misspelled at the source.
- `displayResolution` holds the **inches** and `displaySize` the **pixels**: they
  are swapped with respect to their names. The screen resolution the brief asks
  for comes from `displaySize`.
- `price` arrives as a string and can be empty, which means "not for sale", not
  "costs 0 €".
- The API is deployed on a free plan that suspends the instance: the first
  request after a while idle can take tens of seconds. That is why the timeout is
  45 s.

## Persistence

| #       | Requirement                                          |
| ------- | ---------------------------------------------------- |
| CACHE-1 | The response is stored every time the API is queried |
| CACHE-2 | It expires after one hour and is then revalidated    |
| CACHE-3 | Storage is always client-side                        |

Implemented in `lib/cache.js` (`createCache`, `ONE_HOUR_MS`) and consumed from
`api/products.js`. Mutations (`POST /api/cart`) are **never** cached.
