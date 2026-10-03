# Status — handoff log

> Update this file at the end of every session (`/handoff`). Newest session on top. Keep "Now" short and true.

## Now

- **Phase:** SLC
- **Current task:** **T-06b** (branch `t-06b-review-actions`, plan in TASKS Notes). Dev settings in `.env.local`: `IMAGE_VARIANTS_PER_SLIDE=1`, `MONTHLY_AI_BUDGET_INR=300` → back to 3 and 1500 for T-09.
- **Last thing done:** T-06 core — the month page is now a review feed: drawn slides with a carousel, Instagram / LinkedIn captions, Approve / Undo, Edit text (limits enforced, only that post redrawn).
- **Next action:** Run `/start`. **T-06b** (request changes → Claude rewrite, artwork swap / regenerate, approve all), then T-07 (email) → **milestone M2**, T-08, T-09. M1 confirmed by Vivek (October posts look good).
- **Blockers:** None for building. Brand kit fonts/colours still to be signed off by the owner (not blocking). Suggested-day dates cover Oct 2026 – Dec 2027 only; extend `web/src/data/suggestedDays.ts` for later months.
- **Production URL:** — (set in T-09)

## Session log

### 2026-10-03 · T-06 session (Claude, Claude Code)
- Review feed + approve / undo / edit with the planning limits. Split T-06b. Tested on a scratch month (deleted).

### 2026-10-03 · T-05b session (Claude, Claude Code)
- Render job + DB→renderer mapping; tested on a scratch month (5 posts, all templates), then deleted it with its R2 renders. Found a second phone-width overflow (hidden file inputs). M1 is ready: Vivek presses Plan again on October.

### 2026-10-03 · T-05 session (Claude, Claude Code)
- Checked the price (account estimate: $0.006 per 1080p image), built the Higgsfield client and artwork step. First real image had garbled fake text; fixed by rewording the house style and banning text-prone scene words (13 images, ≈ $0.08, under Vivek's $2 allowance). Scratch rows deleted; test pictures are in the library (kind `ai`).

### 2026-10-03 · T-04c session (Claude, Claude Code)
- Researched holiday dates from the official DoP&T lists and UN observances; built suggestions + PDF import (~1c per import). Added `pnpm screenshot`; its first run caught a phone-width overflow bug from T-04b (fixed). Vivek's October month was left untouched; tests used scratch months that were deleted.

### 2026-10-03 · Working agreements (Claude, claude.ai)
- Added `.claude/settings.json` (pre-approved routine commands, blocked risky ones), scope freeze and model guidance in `CLAUDE.md`, self-checks and milestone reviews (M1–M3) in `docs/SDLC.md`. Task order unchanged.

### 2026-10-03 · T-04b session (Claude, Claude Code)
- Calendar builder: `calendar_entries` + `posts.entry_id`, entry API, month grid / Add post sheet / Plan dialog, planning from entries (Claude writes words only; `resolvePlan` copies facts). Real test ~6c: posts 1:1 with entries, exact exhibition facts, post-only fix reads the cache. Vivek approved. Split T-04c (PDF import + suggested days). Dev server was already on port 3000 (Vivek's); the old PDF upload dialog and R2 calendar read are gone from the plan path.

### 2026-10-03 · T-03d session (Claude, Claude Code)
- Slim CI (ADR-016): PR-only trigger, Docker job only when Docker inputs change, badge removed. Deleted four stale local branches (all their PRs were squash-merged). Remote branches `origin/t-04-library`, `origin/docs/handoff-t04`, `origin/docs/t-04b-calendar-builder` are still there (safe to delete).

### 2026-10-03 · T-04 session (Claude, Claude Code)
- Deleted five stale remote branches (contents were already on main). Built migration 0002, plan-schema image slots + docs/template (Image column), library backend + seed, `/library`, month-page slots. Real test with R2/Neon/Claude (~$0.07). Required images are never auto-filled. PR #7 auto-merged with CI green (Docker job ran because code changed). Handoff shipped as its own docs-only PR (Docker job skipped).
- Gap found: nothing renders saved posts yet (ARCHITECTURE step 4) → new task T-05b. Added backlog L-01 (library polish).

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
