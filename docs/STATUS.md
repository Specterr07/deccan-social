# Status — handoff log

> Update this file at the end of every session (`/handoff`). Newest session on top. Keep "Now" short and true.

## Now

- **Phase:** SLC
- **Current task:** T-04 (photo library + image slots) — `doing`, branch `t-04-library` (plan in TASKS Notes); T-03d (slim CI) after it
- **Last thing done:** T-03c done and merged — `ai_calls` cost log, `callClaude` wrapper, cached + post-only plan retries, AI budget + spend line, SQL migrations (baselined).
- **Next action:** Migration 0002, plan schema + docs, library backend, `/library`, slot UI on the month page, seed + tests.
- **Blockers:** None. Brand kit fonts/colours to be signed off by the owner (not blocking).
- **Production URL:** — (set in T-09)

## Next session — Vivek wants to discuss first
- T-03d: Docker CI job too slow; too many CI runs for a solo developer (see TASKS).
- Then T-04 (photo library + image slots, ADR-014).

## Session log

### 2026-10-03 · Shipping workflow (Claude, Claude Code)
- New rule: one PR per task incl. the handoff commit; `cd web && pnpm check` before every push; `gh pr create --fill` + `gh pr merge --auto --squash --delete-branch`; do not watch CI. CI now has a `changes` job and skips the Docker job for docs-only changes (skipped jobs satisfy branch protection). Docs: `docs/SDLC.md` step 5, `docs/CICD.md`, `CLAUDE.md`.
- Open items from before: remote branches `docs/ai-cost-plan` and `t-03c-ai-cost` may still exist (safe to delete).

### 2026-10-03 · T-03c session (Claude, Claude Code)
- Env rename (`MONTHLY_AI_BUDGET_INR`, `CLAUDE_MODEL_LIGHT`), migrations baselined + `ai_calls`, `callClaude` wrapper, cheaper retries, budget helper, spend line. Kept effort `medium` (low dropped an expo day). PR #3, CI green.

### 2026-10-03 · T-03b session (Claude, Claude Code)
- Opened PR #1 to run CI: both jobs green first time. Added README badge, merged, then enabled branch protection on `main` with Vivek's approval.

### 2026-10-02/03 · T-03 session (Claude, Claude Code)
- Wrote `docs/CONTENT-LIMITS.md` and `samples/calendar-template.md`; built schema + limit checks, `planMonth()` (structured outputs, one correction retry), R2 helper, plan job via `after()`, upload dialog, month page. ADR-010. Real end-to-end run OK (~$0.05-0.12 per plan).
- Pushed to origin/main at the start of the session and again after T-03.

### 2026-10-02 · T-02 session (Claude, Claude Code)
- Built `web/src/lib/render/` (7 React templates, HTML builder, shared Playwright browser, `renderSlide`), dev gallery. Vivek approved the renders.
- Gotchas in T-02 Notes (react-dom/server + Turbopack workarounds, in-page function rule). Docker rendering still untested (T-09).

### 2026-10-02 · T-01b session (Claude, Claude Code)
- Added Tailwind v4 + shadcn/ui (radix-nova), brand-token theme, local brand fonts, `(app)` shell with header/nav, placeholder `/library`. Vivek approved the look.
- Gotchas recorded in T-01b Notes (shadcn init needs Tailwind first; `cn` is a real package; typecheck runs `next typegen`).

### 2026-10-02 · T-01 session (Claude, Claude Code)
- Scaffolded `web/` (Next.js 16, Drizzle schema pushed to Neon, signed-cookie login via `proxy.ts`, Dockerfile built from repo root). Vivek confirmed login works.
- Notes: pnpm installed via `npm -g`; `env.ts` skips validation only during `next build`; Higgsfield has $5 credit, unused so far.

### 2026-10-02 · Keys session (Claude, claude.ai)
- Created `.env.local` (APP_PASSWORD + SESSION_SECRET generated on the Mac) and `scripts/check-env.mjs` provider checker.
- Decided: Claude API key (not identity federation) for now; WIF is a Phase 2 idea on Fly.io. Stay on Claude rather than Groq (native PDF input, structured output, est. < $1/month).
- T-00 done: 5/5 providers verified.

### 2026-10-01 · Planning session (Claude, claude.ai)
- Agreed scope: SLC with Higgsfield artwork included; auto-publishing deferred to Phase 2.
- Built brand kit v1 (tokens, logos traced from the D-leaf mark, 5 templates, voice rules) — Vivek approved the design language.
- Wrote PRD, architecture (SLC + ideal), tasks T-00…T-09, SDLC, decisions ADR-001…007.
- Verified Higgsfield API basics (auth, SDK, polling, retention, no charge on failed/nsfw) → `docs/integrations/higgsfield.md`.
