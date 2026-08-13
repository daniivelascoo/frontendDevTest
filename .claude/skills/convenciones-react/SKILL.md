---
name: convenciones-react
description: This project's conventions for writing components, hooks, CSS Modules and the data layer in React with JavaScript. Use it before creating or refactoring any file under src/, so that new code does not clash with what is already there.
---

# How code is written in this project

Concrete rules, not general principles. If a rule gets in the way of solving a
problem properly, break it and explain why in a comment.

## Folder structure

```
src/
├── api/         HTTP client and services. The only layer that knows the API.
├── lib/         Pure logic without React: cache, format, search, specs.
├── hooks/       Reusable hooks.
├── context/     Shared state (cart, breadcrumbs).
├── components/  Presentational components, grouped by domain.
│   ├── layout/  Header, breadcrumbs, cart counter, page structure.
│   ├── product/ Everything product-specific.
│   └── ui/      Generic pieces with no domain knowledge.
└── pages/       One folder per router view.
```

Dependencies always run in the direction `pages → components → hooks → lib`.
A file in `lib/` that imports React is a sign it sits in the wrong layer.

## Language

Code, comments, JSDoc and test names are written in **English**.

User-facing strings stay in **Spanish** — button labels, messages, `aria-label`,
`alt` text. They are the product, not documentation, and the test assertions
match them literally.

## Components

- **Named exports**, never `export default`. It makes renaming easier and stops
  two files importing the same component under different names.
- One component per file, named after the file.
- No `PropTypes`: contracts are documented with a **JSDoc** block above the
  component and verified with tests.
- No `React.FC`, no types: this is JavaScript.
- Import paths carry the extension (`./Button.jsx`), because the project uses
  native ESM.

```jsx
/**
 * What the component solves and, if there is anything non-obvious, why it was
 * solved that way.
 *
 * @param {object} props
 * @param {string} props.label
 */
export function MyComponent({ label }) {
  /* … */
}
```

## Styles

- One `Component.module.css` next to its `Component.jsx`.
- **Every** value comes from the tokens in `styles/tokens.css`. If you need a
  colour or a spacing that does not exist, add it as a token; do not hardcode it
  in the module.
- Class names in `camelCase`, because that is how they are consumed from JS.
- Media queries go in `rem`, and the design is thought out mobile-first.
- No inline styles except in `ErrorBoundary`, which must work even if the
  stylesheet never loaded.

## State and data

- API requests **only** from `api/`. A component never calls `fetch`.
- All remote data goes through `useAsyncResource`, which exposes a `status`
  (`idle` / `loading` / `success` / `error`) instead of loose booleans.
- When rendering, always cover the four states: loading, error, empty and with
  data. An empty state without a message is a bug.
- Local state with `useState`; shared state with Context. Nothing else is needed
  for a two-view application.
- If a value can be rebuilt from another, do not store it in state: derive it
  with `useMemo`.

## Security

The attack surface is small, but two rules hold it in place:

- **Never `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function`.**
  There is currently not a single one in `src/`; keep it that way.
- **URLs coming from the API are sanitised before reaching the DOM.** React
  escapes text but does **not** validate the `src` attribute.
  `lib/imageUrl.js` (`sanitizeImageUrl`) accepts `http(s)` and relative paths
  and rejects everything else; `ProductImage.jsx` applies it. Both the list card
  and the detail page render their image through that component, so it is the
  only place that needs to sanitise. What fails validation falls back to the
  existing placeholder.

The Content Security Policy is injected from `vite.config.js` on **build only**
— in development it would block Vite's HMR WebSocket and React Refresh. It
restricts `script-src`, `connect-src` and `img-src` to the app's own origin plus
the API host. `style-src` needs `'unsafe-inline'` because `ErrorBoundary` styles
itself through the `style` attribute on purpose.

`frame-ancestors` and HSTS only take effect as real HTTP headers, so they belong
to the hosting configuration and cannot be solved from the code.

## Accessibility

Not an optional extra; `eslint-plugin-jsx-a11y` runs on every commit.

- Pick the HTML element for its semantics before reaching for ARIA: `fieldset`
  and `radio` for the selectors, `dl` for label-value pairs, `ul`/`li` for lists.
- Every interactive control needs an accessible name: visible text, `aria-label`
  or an associated `<label>`.
- States perceived only visually (result count, product added) are announced
  with `aria-live`.
- Decorative images carry `aria-hidden="true"`; informative ones carry an `alt`
  that describes the product.

## Comments

Comment the **why**, never the what. A comment that paraphrases the next line is
noise that also ages badly.

Worth a comment: the API's quirks, decisions that look odd without context (why
the `AbortSignal` is not propagated, why state is adjusted during render) and
deliberate trade-offs.

## Before calling anything done

```bash
npm run check   # lint + format + tests + build
```

The `PostToolUse` hook already formats and lints every file you touch, so
`check` should almost never surprise you.
