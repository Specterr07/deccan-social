# CI/CD

Goal: `main` is always green and deployable; every AI or human session starts from working code. Decided in ADR-011.

## Stages

| Stage | When | What |
| --- | --- | --- |
| 1 · CI | T-03b (now) | `.github/workflows/ci.yml` on every push to `main` and every PR: pnpm install (cached) → `typecheck` → `lint` → `next build` → Docker image build (not pushed, layer cache in GitHub Actions). Branch protection on `main` requires both jobs to pass. |
| 2 · Safe migrations | Before T-09 | Replace `drizzle-kit push` with `drizzle-kit generate` (SQL migrations committed in `web/drizzle/`) + a migrate script run by Fly's `release_command`, so schema changes apply before new code goes live and a failed migration stops the deploy. Keep `db:push` for local experiments only. |
| 3 · CD | T-09 | New `deploy` job in the workflow: on push to `main`, after `web` + `docker` pass, `flyctl deploy --remote-only`. Auth with a Fly **deploy token** scoped to this app (`fly tokens create deploy`), stored as the GitHub secret `FLY_API_TOKEN`. App secrets live only in `fly secrets`. Region `bom` (Mumbai). |
| 4 · Later | Phase 2+ | Smoke test that renders one sample post in CI (Playwright image). Neon branch per PR as a preview database. Dependabot (weekly, grouped). Deploy notifications. |

## Rules

- Never commit secrets; CI needs none for stages 1–2 (`env.ts` skips validation at build time).
- A red CI run on `main` is fixed before any new task starts (`/start` checks it).
- Keep the Playwright version in `web/package.json` and the Dockerfile base image tag identical.
- Not doing (overkill at this size): Kubernetes, Terraform, separate staging app.

## Useful commands

```bash
gh run list --limit 5          # recent CI runs
gh run watch                   # follow the current run
gh run view --log-failed       # logs of the failed step
```
