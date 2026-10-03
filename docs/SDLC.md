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
- **Self-check before asking Vivek** (he reviews at milestones, not every task):
  - Screens: screenshot each changed page with Playwright at 1440 px and at 390 px (phone) into `web/.renders/` (git-ignored), look at the images, fix what's off. The first task that needs it adds `web/scripts/screenshot.ts` (`pnpm screenshot <path…>`, logs in with `APP_PASSWORD`).
  - Posts: render the affected templates and compare side by side with `brand/templates/*.png` (layout, fonts, colours, nothing cut off).
  - Write what you checked, and anything you couldn't, in the task's Notes.
- Paid APIs: test with n=1 first; confirm cost logging.

### Milestone reviews (Vivek, in the browser)
- **M1 · Posts render** — after T-05b: a planned month shows real post images.
- **M2 · Review flow** — after T-06/T-07: approve, edit, request changes, approval email.
- **M3 · Live** — after T-09: deployed, October run end to end.
Between milestones, don't wait for Vivek; finish the task and ship it.

## 4. Review (`/review`)
Self-review the diff: correctness, brand rules, secrets, error handling and user-facing messages, dead code, `.env.example` updated, docs updated if behaviour changed.

## 5. Ship
One pull request per task, **including the handoff commit** (update `docs/TASKS.md` and `docs/STATUS.md` on the task branch before pushing).

1. `cd web && pnpm check` (typecheck + lint + build). Fix anything red; never push a failing check.
2. `git push -u origin <branch>`, then:
   ```bash
   gh pr create --fill
   gh pr merge --auto --squash --delete-branch
   ```
   GitHub merges the PR by itself once the required checks pass (branch protection, see `docs/CICD.md`).
3. **End the session without watching CI.** Do not poll or sleep on it; the next `/start` checks that `main` is green.
4. Only if you really must wait (for example the next step depends on the merge):
   ```bash
   gh pr checks --watch --fail-fast > /dev/null; echo $?     # 0 = green
   ```
   On a non-zero exit, and only then: `gh run view --log-failed | tail -50`.
- Task → `done` with ticked boxes; anything left becomes a new task.

## Definition of done (every task)
- Acceptance criteria met and ticked.
- Typecheck/lint clean; no secrets committed; `.env.example` current.
- Docs reflect reality (TASKS, STATUS, ADR if a decision was made).
- Merged to `main`.

## If a session stops mid-task
Leave the branch, commit WIP (`wip(t-0N): …`), and write in STATUS "Now": the branch, what works, what doesn't, the exact next step.
