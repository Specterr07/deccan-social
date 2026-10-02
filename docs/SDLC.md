# SDLC — how work moves

A light, five-step loop per task. Each step leaves a trace in the repo so any session (human or AI) can pick up mid-way.

## 1. Plan
- Set the task to `doing` in `docs/TASKS.md`; update "Now" in `docs/STATUS.md`.
- Read the task, the relevant `docs/` sections and `docs/integrations/*` notes.
- Write a 3–7 line plan under the task's **Notes** (files to touch, approach, risks).
- Unclear or conflicting requirement → ask Vivek before building; record the answer in Notes (or an ADR).
- Verify external API details against current docs before coding; save findings in `docs/integrations/`.

## 2. Build
- Branch: `git switch -c t-0N-short-name`.
- Small commits with conventional messages: `feat(t-03): plan month from PDF`.
- Follow `CLAUDE.md` hard rules (brand from `/brand`, zod at boundaries, secrets in env, budget check).

## 3. Verify
- `pnpm typecheck` (and `pnpm lint`) pass.
- Run the feature for real: every acceptance checkbox is ticked by actually doing it.
- Visual work: compare renders with `brand/templates/*.png`; save a sample to `web/.renders/` (git-ignored) if useful.
- Paid APIs: test with n=1 first; confirm cost logging.

## 4. Review (`/review`)
Self-review the diff: correctness, brand rules, secrets, error handling and user-facing messages, dead code, `.env.example` updated, docs updated if behaviour changed.

## 5. Ship
- CI must be green on the branch/PR before merging (see `docs/CICD.md`).
- Merge to `main` (fast-forward or squash), delete the branch.
- Task → `done` with ticked boxes; anything left becomes a new task.
- `/handoff`: update `docs/STATUS.md` (Now + new session-log entry), commit `docs: handoff`.

## Definition of done (every task)
- Acceptance criteria met and ticked.
- Typecheck/lint clean; no secrets committed; `.env.example` current.
- Docs reflect reality (TASKS, STATUS, ADR if a decision was made).
- Merged to `main`.

## If a session stops mid-task
Leave the branch, commit WIP (`wip(t-0N): …`), and write in STATUS "Now": the branch, what works, what doesn't, the exact next step.
