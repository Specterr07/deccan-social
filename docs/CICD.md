# CI/CD

Goal: `main` is always green and deployable; every AI or human session starts from working code. Decided in ADR-011.

## Stages

| Stage | When | What |
| --- | --- | --- |
| 1 · CI | T-03b, slimmed in T-03d (done) | `.github/workflows/ci.yml` on every PR (not on push to `main`, ADR-016): a `changes` job, then `pnpm check` (typecheck → lint → `next build`, pnpm cached). The Docker image build (not pushed, layer cache in GitHub Actions) runs only when `web/Dockerfile`, `web/package.json`, `web/pnpm-lock.yaml`, `web/pnpm-workspace.yaml`, `.dockerignore` or the workflow itself change. Branch protection on `main` requires `Typecheck, lint, build` and `Docker image builds`. |
| 2 · Safe migrations | **Started in T-03c** (Fly `release_command` still to do in T-09) | Replace `drizzle-kit push` with `drizzle-kit generate` (SQL migrations committed in `web/drizzle/`) + a migrate script run by Fly's `release_command`, so schema changes apply before new code goes live and a failed migration stops the deploy. Keep `db:push` for local experiments only. |
| 3 · CD | T-09 | New `deploy` job in the workflow, with a `push` to `main` trigger added for that job only: after the PR checks passed, after `web` + `docker` pass, `flyctl deploy --remote-only`. Auth with a Fly **deploy token** scoped to this app (`fly tokens create deploy`), stored as the GitHub secret `FLY_API_TOKEN`. App secrets live only in `fly secrets`. Region `bom` (Mumbai). |
| 4 · Later | Phase 2+ | Smoke test that renders one sample post in CI (Playwright image). Neon branch per PR as a preview database. Dependabot (weekly, grouped). Deploy notifications. |

## Shipping a task (the short version)

`cd web && pnpm check` → push the task branch → `gh pr create --fill` → `gh pr merge --auto --squash --delete-branch` → end the session. One PR per task, handoff docs included. Details and the "must wait" variant are in `docs/SDLC.md` step 5.

**Why a `changes` job instead of `paths-ignore`:** with workflow-level `paths-ignore` a docs-only PR would start no workflow, so the required checks never report and the PR can never merge. Here the workflow always runs; the Docker job is *skipped* when no Docker input changed, and GitHub treats a skipped required job as passing. The `Typecheck, lint, build` job still runs on every PR (about a minute) because it is cheap and keeps the rule simple. The list of Docker input files lives in the `changes` job; keep it in step with `web/Dockerfile`. If `changes` itself fails, `docker` is skipped as well, so a failed `changes` shows red on the PR.

**Repo settings this relies on:** "Allow auto-merge" is on; squash merging is allowed; branch protection requires the two checks above (admins are not enforced, so the owner can still push to `main` in an emergency).

## Rules

- Never commit secrets; CI needs none for stages 1–2 (`env.ts` skips validation at build time).
- A PR is only merged green, so `main` stays green; `/start` still checks `git status` and recent PRs. Sessions do not watch CI after opening a PR; auto-merge does the merging.
- Keep the Playwright version in `web/package.json` and the Dockerfile base image tag identical.
- Not doing (overkill at this size): Kubernetes, Terraform, separate staging app.

## Useful commands

```bash
gh run list --limit 5          # recent CI runs
gh run watch                   # follow the current run
gh run view --log-failed       # logs of the failed step
```

## Database migrations (how it works now)

- Change `web/src/db/schema.ts` → `cd web && pnpm db:generate --name <what_changed>` → review and commit the new `web/drizzle/NNNN_*.sql` (never edit one that has been applied) → `pnpm db:migrate` applies it. `db:push` was removed from `package.json`; do not run `drizzle-kit push` against Neon.
- History: tables were first created with `push` (T-01..T-03). In T-03c we **baselined**: `0000_baseline.sql` was generated from the then-current schema and recorded as applied in Neon with `pnpm db:baseline` (one-off script `web/scripts/baseline-migrations.ts`; it refuses to run on an empty database and does nothing if anything is already recorded). Nothing was dropped. Use `db:baseline` again only for another database that already has these tables from `push`; a brand-new database just runs `db:migrate`.
- `web/scripts/migrate.ts` reads only `DATABASE_URL`, so at T-09 it can run as Fly's `release_command` (the image already contains `scripts/` and `drizzle/`; `tsx` is installed because the image installs dev dependencies).
- Still to add: a CI step that fails when `schema.ts` and the committed migrations disagree (`drizzle-kit generate` produces no new file).

