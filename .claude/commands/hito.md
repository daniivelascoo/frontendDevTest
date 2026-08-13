---
description: Closes a project milestone by verifying and creating a commit with a descriptive message
argument-hint: [short description of the milestone]
allowed-tools: Bash(npm run check), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Read
---

The brief asks for an **incremental** delivery: the history must read as a
sequence of self-contained milestones. This command closes one.

Milestone to close: $ARGUMENTS

Steps:

1. Run `npm run check`. If it fails, do **not** commit: fix what is broken
   first.
2. Review `git status` and `git diff` to know exactly what you are about to
   commit. Check nothing slips in that should not: `.env`, `dist/`,
   `node_modules/`, temporary files.
3. Stage the files belonging to the milestone. If the tree contains changes from
   two different topics, say so and ask before mixing them into one commit.
4. Create the commit following the format of the previous ones
   (`git log --oneline`). Project convention: `type: description in the
imperative`, with the types `feat`, `fix`, `test`, `docs`, `chore`,
   `refactor`, `style`.

The message body explains **what the milestone adds and why**, not the list of
files touched — that is already in the diff.

Commit messages are written **in Spanish**, unlike the rest of the
documentation. The existing history is in Spanish and cannot be rewritten, so
switching language now would leave the log half and half.

Do not `push` unless explicitly asked.
