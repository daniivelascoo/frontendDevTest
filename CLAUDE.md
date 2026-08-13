# CLAUDE.md

SPA mini-application for buying mobile devices. It is a front-end technical
test: the reviewer will read both the code and the git history, so the two of
them are part of the deliverable.

## Commands

```bash
npm start                # development server at http://localhost:3000
npm run build            # production build
npm test                 # tests (single run)
npm run test:watch       # tests in watch mode
npm run lint             # ESLint
npm run check            # lint + format + tests + build
npx vitest run src/lib   # tests for a single folder
```

The first four scripts are required by the brief: **do not rename them**.

## Loadable documentation

Invoke the matching skill before working; they hold the detail that is not
repeated here.

| Skill                | When                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `spec-itx`           | What the application must do: requirements, API contract, its typos |
| `convenciones-react` | How the code is written: structure, components, CSS, state          |
| `testing-rtl`        | How tests are written: helpers, fixtures, known pitfalls            |

Agents: `auditor-spec` (brief compliance), `revisor-react` (code review),
`autor-tests` (missing coverage).

Commands: `/verificar`, `/hito`, `/componente`, `/auditar`.

Skill, agent and command names stay in Spanish: they are identifiers you type
or reference, not prose. Everything else — documentation, comments, JSDoc and
test names — is written in English. The user-facing UI strings stay in Spanish,
because they are the product.

## Architecture on one screen

```
pages/       One router view. They orchestrate; they hold no business logic.
components/  Presentation, grouped into layout/ · product/ · ui/
hooks/       useProducts, useProduct, useAsyncResource, useDebouncedValue
context/     CartProvider (cart) · BreadcrumbsProvider (breadcrumbs)
api/         The only layer that knows the API: http.js + products.js
lib/         Pure logic without React: cache, search, format, productSpecs,
             storage, imageUrl
```

Dependencies always run in the direction `pages → components → hooks → lib`.
A file in `lib/` that imports React is in the wrong layer.

## Decisions worth not undoing without a reason

- **The cache is a module singleton** (`appCache` in `lib/cache.js`) and
  `api/products.js` de-duplicates in-flight requests. This is what stops
  StrictMode's double mount from firing duplicate requests. Tests must call
  `invalidateProductCache()` in their `beforeEach`.
- **The caller's `AbortSignal` is not propagated to the shared request.** If it
  were, unmounting one component would cancel the request others are waiting
  on. Cancellation is handled in `useAsyncResource`, which discards the result
  instead of aborting the network.
- **The search term lives in the URL** (`?q=`), not in component state, so it
  survives coming back from a product detail page.
- **The cart counter uses its own storage key**, outside the cache namespace,
  so neither expiry nor a retry can wipe it.
- **Image URLs from the API are sanitised** in `lib/imageUrl.js`, applied in
  `ProductImage.jsx` — the single point where an API `src` reaches an `<img>`.
  React escapes text but does not validate `src`.
- **The CSP is injected from `vite.config.js`, build only.** A fixed `<meta>`
  in `index.html` would block Vite's HMR WebSocket and React Refresh during
  development.

## When finishing any change

`npm run check` has to pass. The `PostToolUse` hook already formats and lints
every file you touch, so it should rarely surprise you.
