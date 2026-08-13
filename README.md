# Mobile Store — front-end technical test

SPA mini-application for buying mobile devices: a product list with search, and
a detail page with purchase options and add-to-cart.

The user interface is in Spanish; the code, comments and documentation are in
English.

## Prerequisites

- **Node.js 20.19 or higher** (tested with Node 22)
- npm 10 or higher

## Getting started

```bash
npm install
npm start
```

The application runs at <http://localhost:3000> and opens the browser by itself.

> **First load is slow.** The test API is deployed on a free Render plan that
> suspends the instance when idle. The first request after a while can take up
> to a minute; from then on the response is immediate and, on top of that, it
> stays cached for an hour. The client timeout is 45 s precisely because of this.

## Scripts

| Script                  | What it does                                     |
| ----------------------- | ------------------------------------------------ |
| `npm start`             | Development server with hot reload               |
| `npm run build`         | Production build into `dist/`                    |
| `npm test`              | Tests (single run)                               |
| `npm run lint`          | Static analysis with ESLint                      |
| `npm run test:watch`    | Tests in watch mode                              |
| `npm run test:coverage` | Coverage report                                  |
| `npm run format`        | Formats the code with Prettier                   |
| `npm run preview`       | Serves the production build locally              |
| `npm run check`         | Full verification: lint + format + tests + build |

## Configuration

None required: the defaults point at the test API. To change them, copy
`.env.example` to `.env`:

```bash
VITE_API_BASE_URL=https://itx-frontend-test.onrender.com
VITE_CACHE_TTL_MS=3600000
```

## Stack

| Piece    | Choice                      | Why                                                                 |
| -------- | --------------------------- | ------------------------------------------------------------------- |
| Build    | Vite 6                      | Instant startup and a zero-config build                             |
| UI       | React 19                    | Required by the brief                                               |
| Routing  | React Router 7              | SPA with client-side routing, no SSR                                |
| Language | JavaScript (ES6+)           | The brief allows ES6; contracts are documented with JSDoc           |
| Styles   | CSS Modules + design tokens | Isolation with no dependencies and no runtime                       |
| Tests    | Vitest + Testing Library    | Shares configuration with Vite; tests behaviour, not implementation |
| State    | Hooks + Context             | Enough for two views; zero boilerplate                              |

No third-party dependencies beyond React and the router: the cache, the HTTP
client and the filtering are all hand-written, which is exactly what the test
evaluates.

## Structure

```
src/
├── api/         HTTP client and services. The only layer that knows the API.
│   ├── config.js      Domain, timeout and endpoints
│   ├── http.js        fetch wrapper with timeout and typed errors
│   └── products.js    Services + cache + request de-duplication
├── lib/         Pure logic without React
│   ├── cache.js       Cache expiring after 1 hour
│   ├── storage.js     Fault-tolerant localStorage adapter
│   ├── search.js      Filtering by brand and model
│   ├── format.js      Prices, weights and specification values
│   ├── productSpecs.js Translation of the API detail into a spec sheet
│   ├── availability.js Whether a product can be bought, and why not
│   ├── listPosition.js List position when returning from a detail page
│   └── imageUrl.js    Sanitising of image URLs coming from the API
├── hooks/       useProducts · useProduct · useAsyncResource
│                useDebouncedValue · useInfiniteScroll
├── context/     CartProvider (cart) · BreadcrumbsProvider (breadcrumbs)
├── components/  layout/ · product/ · ui/
├── pages/       ProductListPage · ProductDetailPage · NotFoundPage
└── test/        setup, fixtures and render helpers
```

## Technical decisions

### Cache with a one-hour expiry

`lib/cache.js` implements a cache over `localStorage` where each entry stores its
own expiry instant. On read, an expired entry is removed and treated as absent,
which forces revalidation against the API.

The expiry instant is stored rather than the creation instant so that an entry
written with a specific TTL keeps it even if the global configuration changes
later. If `localStorage` is unavailable — private mode, blocked cookies, quota
exceeded — it degrades to memory instead of breaking: the cache is an
optimisation, never a requirement for the application to work.

Mutations (`POST /api/cart`) are never cached.

### Request de-duplication

`api/products.js` keeps a registry of in-flight requests by key. Without it,
React's double mount in StrictMode — or two components asking for the same
product — would fire duplicate requests before the first one wrote to the cache.

The caller's cancellation signal is deliberately not propagated to that shared
request: if it were, unmounting one component would cancel the request other
consumers are waiting on. Cancellation is handled in `useAsyncResource`, which
discards the stale result instead of aborting the network.

### Search

Filtering happens on the client over the full list: there are 100 products and a
single endpoint with no search parameters, so filtering in memory is instant and
generates no traffic.

The term lives in the query string (`?q=`), not in component state. That makes a
search shareable, lets it survive a reload and — the part you notice most in use
— keeps it there when you come back from a product detail page.

On top of the minimum the brief asks for (matching brand and model), the search
ignores case and accents and accepts terms in any order: "s9 samsung" finds the
Samsung Galaxy S9.

There is a 250 ms _debounce_. **Filtering is still real-time**: the input
responds on every keystroke and the only thing deferred is recomputing the list.

### Loading and error states

All remote data goes through `useAsyncResource`, which exposes an explicit state
machine (`idle` / `loading` / `success` / `error`) instead of loose booleans,
removing impossible states of the "loading and errored at once" kind.

All four situations are covered in both views: a loading skeleton in the list, an
error with a retry button, an empty result with the option to clear the search,
and a 404 that is distinguished from a server error (retrying a 404 would only
repeat the same error, so the button is not offered in that case).

### Infinite scroll

The list shows products in batches of 12 and extends as the user approaches the
end, via an `IntersectionObserver` on a sentinel.

**This is not server pagination.** The API delivers all 100 products at once and
accepts no paging parameters, so nothing new is requested here: it only decides
how many of the ones already in memory get rendered. That avoids mounting 100
cards — and their 100 images — on the first paint.

This still satisfies the requirement to show every item the API returns: they are
all available and reachable without filtering anything; the only difference is
that they appear progressively.

**Each batch loads after a deliberate pause.** The products are already in
memory, so technically they could appear instantly; the problem is that they then
pop in all at once with nothing indicating a load happened. During the pause,
ghost cards hold the place of the incoming products, so the list's growth is
anticipated rather than jumping. The button is not replaced by an indicator: it
stays mounted in a busy state, because if it disappeared, someone who had just
pressed it with the keyboard would lose focus.

An in-flight batch is cancelled if the user changes the search — it belonged to a
different list — and repeated firing of the observer does not chain several
batches.

Infinite scroll has two more known problems, and both are solved:

- **It leaves out people who do not scroll.** Without a real control to focus,
  keyboard users have no way to request the next batch. That is why, next to the
  sentinel, there is a "Cargar más productos" button doing the same thing
  explicitly, and progress is announced with `aria-live` on every batch.
- **It loses your place when you go back.** Entering a detail page and returning
  would send the user back to the first 12 products, forcing them to redo all the
  scrolling. The position is stored in `sessionStorage` keyed by the search term
  — if they come back with a different search, it is ignored — and `ScrollToTop`
  does not jump to the top on `POP` navigations, so the browser restores the
  scroll.

Changing the search term returns to the first batch: staying on the third batch
of a list that now has two results would make no sense.

### Responsive grid

The brief caps the layout at four items per row. The grid uses `auto-fill` to
drop columns as the window narrows and pins exactly four columns from `64rem`
upwards, so a fifth never appears on wide screens.

### Security

The attack surface is small — no authentication, no tokens, no cookies, no
personal data — but three measures hold it in place:

- **No injection sinks.** There is not a single `dangerouslySetInnerHTML`,
  `innerHTML`, `eval` or `new Function` in `src/`. All text goes through React's
  automatic escaping.
- **API image URLs are sanitised.** React escapes text but does **not** validate
  the `src` attribute: whatever the server returns gets painted as-is.
  `lib/imageUrl.js` accepts `http(s)` and relative paths and rejects `javascript:`,
  `data:`, `blob:` and `file:`, including forms obfuscated with line breaks. It is
  applied in `ProductImage.jsx`, the single point where an API URL reaches an
  `<img>` — both the card and the detail page render through it. Anything that
  fails validation falls back to the same placeholder that already covers broken
  images.
- **Content Security Policy**, injected from `vite.config.js` on **build only**:
  a fixed `<meta>` in `index.html` would block Vite's HMR WebSocket and React
  Refresh during development. It restricts `script-src`, `connect-src` and
  `img-src` to the app's own origin plus the API host, and disables `object-src`
  and `frame-src`. `style-src` needs `'unsafe-inline'` because `ErrorBoundary`
  styles itself through the `style` attribute on purpose, so it can render even
  if the stylesheet never loaded. It ships alongside
  `referrer: strict-origin-when-cross-origin`, which matters here because the
  search term travels in the URL as `?q=`.

`frame-ancestors` (clickjacking) and HSTS only take effect as real HTTP headers,
so they belong to the hosting configuration rather than the code.

### Accessibility

Not a cosmetic add-on: `eslint-plugin-jsx-a11y` runs on every `lint`.

- The purchase selectors are real `fieldset` + `input[type=radio]`, not buttons
  with ARIA: group semantics and arrow-key navigation come for free.
- The spec sheet uses definition lists, which is exactly what label-value pairs
  are.
- The search result count and the add-to-cart confirmation are announced with
  `aria-live`.
- Skip link to the main content, visible focus on every control, and respect for
  `prefers-reduced-motion`.

### API quirks

Detected against the real server and respected in the code and the fixtures:

- `dimentions` and `secondaryCmera` are misspelled at the source.
- `displayResolution` holds the **inches** and `displaySize` the **pixels**: they
  are swapped with respect to their names. The "screen resolution" the brief asks
  for therefore comes from `displaySize`.
- `price` arrives as a string and can be empty, which means "not for sale" and
  not "costs 0 €". The UI shows it as "Precio no disponible".

### Missing data

The API omits data in several ways — empty string, whitespace only, `null`,
missing field or empty array — and the detail page applies **two opposite rules**
depending on how important the attribute is:

- **Mandatory attributes** (the eleven the brief requires): the row is always
  kept and the value shown as `-`, dimmed. Keeping it lets you compare two
  products line by line and makes clear that the data was looked up and the API
  does not provide it, which is not the same as simply omitting it. For screen
  readers a "Dato no disponible" text is added, since a lone dash would be read
  as "minus".
- **Secondary attributes** (inside "Ver especificaciones completas"): the row
  disappears entirely, label included. If the API has no GPU, not even the "GPU"
  label appears. Twenty dashed rows would turn the page into a list of absences.
  A group left with no rows disappears too, so no orphan heading is left behind.

The same idea applies outside the spec sheet: a card without a brand does not
leave an empty gap, a product without a name keeps a readable heading so the link
has an accessible name, and a missing or failing image shows a placeholder
instead of the broken-image icon.

### Products that cannot be bought

A product is only buyable if it meets all three conditions: it has a **price**,
at least one **storage** option and at least one **colour** option. Without a
price there is nothing to sell, and without options there is no `colorCode` or
`storageCode` for the `POST /api/cart`: the request could not even be built.

When any of them fails, the add button is disabled and a notice appears naming
**every** reason:

> Este producto no está disponible para la compra porque no tiene precio,
> opciones de almacenamiento ni opciones de color.

All of them are listed rather than just the first, because an explanation that
keeps changing — "the price is missing", then "the colours are missing" — reads
like it is making excuses. The notice is linked to the button with
`aria-describedby` so a screen reader announces it on arrival: a disabled, silent
button leaves the user guessing.

The selectors are still shown even when the product is not buyable, so the user
can see which options exist. And a price of `0` counts as a valid price: it means
free, not missing.

An option is only considered eligible if it has **both code and name**. The code
is required by the `POST`, and the name is what the user reads to decide. This is
not a theoretical nicety: in the real catalogue, Acer DX650 and Acer M900 return
`storages: [{ code: 2000, name: " " }]`. Accepting that option because it has a
code painted a pill with a dash — which nobody can meaningfully choose — and left
the product marked as buyable.

Running the logic over the 100 products of the real catalogue leaves 8 blocked: 6
without a price and 2 without a usable storage option.

The logic lives in `lib/availability.js`, outside the component, so the
combinations can be tested without mounting React.

## Tests

210 tests with Vitest and Testing Library, 97% line coverage:

| File                                       | What it covers                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `lib/cache.test.js`                        | One-hour expiry, corrupt entries, degradation to memory                           |
| `lib/search.test.js`                       | Filtering by brand and model, accents, term order                                 |
| `lib/format.test.js`                       | Missing prices, specification arrays, units                                       |
| `lib/availability.test.js`                 | When a product cannot be bought and how the reason is explained                   |
| `lib/productSpecs.test.js`                 | The eleven mandatory attributes, the API typos and the two missing-data rules     |
| `lib/imageUrl.test.js`                     | Accepted and rejected URL schemes, including obfuscated ones                      |
| `api/products.test.js`                     | Cache, de-duplication, network errors and the POST contract                       |
| `context/CartProvider.test.jsx`            | Counter persistence and API failure                                               |
| `components/ErrorBoundary.test.jsx`        | Render error capture, logging and recovery on retry                               |
| `components/layout/CartIndicator.test.jsx` | Counter formatting, corrupt storage, live region                                  |
| `components/product/ProductCard.test.jsx`  | Card with missing brand, model, price or image                                    |
| `components/product/ProductImage.test.jsx` | Placeholder on failure, state reset on `src` change, rejection of hostile schemes |
| `pages/ProductListPage.test.jsx`           | List, search, infinite scroll, empty and error states                             |
| `pages/ProductDetailPage.test.jsx`         | Detail page, selectors, preselection, add-to-cart and missing data                |
| `App.test.jsx`                             | Routing table, navigation, breadcrumbs and the cart counter in the header         |

Global `fetch` is stubbed rather than the service modules: that way the tests
exercise the real HTTP client and the real cache, which is where the logic that
matters lives. The fixtures are responses copied from the real API, typos
included.

Test names are in English; the assertions match the Spanish UI strings, since
those are what the application renders.

```bash
npm test
npm run test:coverage
```

## Compliance with the brief

| Requirement                                               | Status |
| --------------------------------------------------------- | ------ |
| SPA with client-side routing, no SSR or MPA               | ✅     |
| Scripts `start`, `build`, `test`, `lint`                  | ✅     |
| PLP with every product from the API                       | ✅     |
| Real-time search by brand and model                       | ✅     |
| Navigation to the detail page from the list               | ✅     |
| At most four items per row, responsive                    | ✅     |
| Two-column PDP: image · details and actions               | ✅     |
| Link back to the list                                     | ✅     |
| Header: linked logo, breadcrumbs and cart counter         | ✅     |
| The eleven mandatory description attributes               | ✅     |
| Storage and colour selectors, preselected                 | ✅     |
| POST to the cart with `id`, `colorCode` and `storageCode` | ✅     |
| Cart counter persisted and visible on every view          | ✅     |
| Client-side cache with a one-hour expiry                  | ✅     |

Beyond the required minimum, purchase blocking is added for incomplete products:
without a price, storage or colour, the button is disabled and the reason
explained.

## Licence

Technical evaluation project, no distribution licence.
