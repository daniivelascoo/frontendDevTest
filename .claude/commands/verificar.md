---
description: Runs the full verification (lint, format, tests and build) and summarises the result
allowed-tools: Bash(npm run check), Bash(npm run lint), Bash(npm test), Bash(npm run build), Bash(npm run format:check), Read, Edit
---

Run `npm run check`, which chains lint, format check, tests and the production
build.

If everything passes, summarise in two lines: number of tests and bundle size.

If something fails:

1. Identify the root cause by reading the output, not by guessing it.
2. Fix it.
3. Run `npm run check` again until it passes.

Do not relax an ESLint rule or weaken a test assertion to make the verification
pass. If a failure reveals that the rule or the test was badly framed, say so
explicitly before touching them.
