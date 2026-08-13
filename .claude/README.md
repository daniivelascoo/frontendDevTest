# Claude Code toolkit

[Claude Code](https://claude.com/claude-code) configuration for developing and
maintaining this project. Everything in this folder is **optional**: the
application installs, runs and tests without it. If you do not use Claude Code,
ignore it.

## What is here

```
.claude/
├── settings.json      Project permissions and hooks
├── skills/            Documentation Claude loads on demand
├── agents/            Specialised subagents
├── commands/          Slash commands (/verificar, /hito, …)
└── hooks/             Scripts run at specific moments
```

`CLAUDE.md` is **not** here but at the repository root, which is where Claude
Code loads it automatically at the start of every session. It is the index: it
summarises the architecture, the commands and the decisions worth not undoing,
and defers to the skills for detail.

## Language

Documentation, comments, JSDoc and test names are in **English**. Two things
stay in Spanish on purpose:

- **Skill, agent and command names** (`spec-itx`, `auditor-spec`, `/verificar`).
  They are identifiers you type or cross-reference; renaming them would break
  every reference and change the commands the user types.
- **User-facing UI strings and commit messages.** The first are the product and
  the test assertions match them literally; the second would leave the git log
  half in each language, and the existing history cannot be rewritten.

## Skills

Documents Claude loads when the task calls for them, instead of occupying
context in every session. The `description` in the frontmatter is what decides
whether they activate, so if you add one, describe it by **when** to use it and
not just by what it contains.

| Skill                | Contents                                                                    | Activates when                                                    |
| -------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `spec-itx`           | Brief requirements with identifier and evidence, API contract and its typos | A view is implemented or modified, or compliance is being checked |
| `convenciones-react` | Folder structure, component style, CSS Modules, security, accessibility     | Any file under `src/` is created or refactored                    |
| `testing-rtl`        | Helpers, fixtures, what to test and known pitfalls                          | A test is written or fixed                                        |

The split is deliberate: `spec-itx` answers **what** the application must do and
`convenciones-react` **how** it is written. When both apply, the first wins.

## Agents

They run in their own context and return a report, so a long audit does not fill
up the main conversation.

| Agent           | What for                                                                           | Can write                        |
| --------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| `auditor-spec`  | Contrasts the project with the brief and returns a compliance table with evidence  | No                               |
| `revisor-react` | Reviews real bugs, accessibility, security and API contract in uncommitted changes | No                               |
| `autor-tests`   | Writes the missing tests following the project's helpers                           | Only `*.test.js(x)` and fixtures |

`auditor-spec` and `revisor-react` are deliberately read-only: an agent that
audits and fixes at the same time tends to gloss over what it finds.

## Commands

| Command                       | What it does                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `/verificar`                  | Runs `npm run check` and fixes what fails, without relaxing rules or assertions   |
| `/hito <description>`         | Verifies and creates the commit for a milestone, following the message convention |
| `/componente <Name> [folder]` | Creates component, CSS Module and test following the conventions                  |
| `/auditar`                    | Launches `auditor-spec` and relays its report                                     |

`/hito` exists because the brief asks for incremental delivery: the git history
is part of what gets evaluated, so closing milestones is a recurring task that
deserves its own command.

## Hooks

| Hook                  | Event                           | What it does                                                                                                                    |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `format-and-lint.mjs` | `PostToolUse` on `Write`/`Edit` | Runs Prettier on the touched file and passes ESLint over it. On errors it exits with code 2 so Claude fixes them there and then |
| `session-context.mjs` | `SessionStart`                  | Injects branch, uncommitted changes, latest milestones and whether dependencies are missing                                     |

Both are written in Node (`.mjs`) rather than shell, so they behave the same on
Windows, macOS and Linux. They receive the event payload on stdin as JSON.

Two decisions worth knowing if you modify them:

- `format-and-lint.mjs` analyses **only the touched file**, not the whole
  project. That keeps it at tenths of a second and stops it taxing every edit;
  global verification is `npm run check`'s job.
- If the hook itself fails, it exits with code 0. A broken hook must never block
  the work.

To disable them temporarily, comment out the `hooks` section of `settings.json`.

## Permissions

`settings.json` pre-authorises routine commands (`npm run lint`, `npm test`,
`git status`, `git diff`…) so you are not interrupted by a confirmation at every
step.

Anything touching the remote repository or destroying work still asks for
permission (`git push`, `git reset --hard`), and reading `.env` files is denied.

## Adding something new

- **Skill**: `.claude/skills/<name>/SKILL.md` with `name` and `description` in
  the frontmatter. Describe it by when it should be used.
- **Agent**: `.claude/agents/<name>.md` with `name`, `description`, `tools` and
  `model`. Give it the minimum tools it needs.
- **Command**: `.claude/commands/<name>.md` with `description` and, where
  relevant, `argument-hint` and `allowed-tools`. Invoked as `/<name>`.
