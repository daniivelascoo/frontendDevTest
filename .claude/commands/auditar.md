---
description: Audits the project against the requirements of the brief and returns a compliance report
allowed-tools: Task, Read, Grep, Glob, Bash(npm test)
---

Launch the `auditor-spec` agent to contrast the current state of the project
with the requirements of the technical test brief.

$ARGUMENTS

When the agent finishes, relay its report in full: the requirements table with
status and evidence, and the lists of blockers and improvements. The user does
not see the agent's report, so you must summarise it without dropping a single
❌ or ⚠️.

Then propose the next concrete step — what you would fix first and why — but do
not start implementing it without confirmation.
