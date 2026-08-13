---
description: Creates a new component with its CSS Module and its test, following the project conventions
argument-hint: <Name> [folder: layout|product|ui] [what it should do]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm test), Bash(npx vitest run:*)
---

Create a new component: $ARGUMENTS

Before writing, read `.claude/skills/convenciones-react/SKILL.md` and open an
existing component from the same folder to mirror its structure and tone.

Generate three files in `src/components/<folder>/`:

1. **`<Name>.jsx`** — named export, JSDoc block above the component describing
   what it solves and its props. No `export default`, no PropTypes.
2. **`<Name>.module.css`** — class names in `camelCase`, every value taken from
   the tokens in `styles/tokens.css`. If you need a value that does not exist,
   add it as a token instead of hardcoding it.
3. **`<Name>.test.jsx`** — tests of observable behaviour, using
   `renderWithProviders` if the component needs the router or context, or
   `renderApp` if it lives in the header.

Non-negotiable requirements:

- Pick the HTML element for its semantics before reaching for ARIA.
- Every interactive control carries an accessible name.
- If the component loads data, cover the four states: loading, error, empty and
  with data.
- Any URL coming from the API must be sanitised before it reaches the DOM (see
  `lib/imageUrl.js`).

Write the code, comments and test names in English; user-facing strings stay in
Spanish.

When done, run the component's tests and show the result.
