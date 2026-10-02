---
description: Self-review the current changes before shipping
---
Review the diff of the current branch against `main` (`git diff main...HEAD` plus uncommitted changes) as a strict senior reviewer. Check:

- Acceptance criteria of the active task in `docs/TASKS.md` — each truly met?
- `CLAUDE.md` hard rules: no AI-drawn text, brand values only from `/brand`, approval before publish, budget check + cost logging on paid calls, facts copied not invented, no secrets in code.
- Zod validation at boundaries; errors surface as clear messages for a non-technical reviewer.
- Typecheck and lint pass (run them).
- Dead code, TODOs without a task, duplicated logic.
- `.env.example` and docs updated where behaviour changed.

List findings as must-fix / should-fix / nit, then fix the must-fix items and re-run checks.

$ARGUMENTS
