# Tasks

Status values: `todo` · `doing` · `blocked` · `done`. One task `doing` at a time. Acceptance criteria = definition of done (plus the general DoD in `docs/SDLC.md`). Add findings under a task's **Notes**; never delete a finished task.

## SLC (target: tonight, ~7h)

### T-00 · Accounts and keys (human) — `done` · 20m
Fill `.env.local` at the project root (already created; APP_PASSWORD and SESSION_SECRET pre-generated): Anthropic API key, Higgsfield API key id + secret (console.higgsfield.ai, add credit), Neon Postgres URL, Cloudflare R2 bucket + keys + public URL, Resend API key (+ verified sender or onboarding domain).
- [x] `cd scripts && npm install && npm run check-env` shows 5/5 ready.
**Notes:** 2026-10-02 — all 5 providers verified on the Mac (Claude model claude-sonnet-5-5 available, Neon Postgres 18.6, R2 read/write/public OK, Resend sending-only key, Higgsfield auth OK — add credit before T-05). Resend uses the onboarding@resend.dev test sender, so mail only reaches the Resend signup address.

### T-01 · Scaffold the app — `done` · 30m
- `pnpm create next-app web` (TypeScript, App Router, Tailwind off, src/ dir, ESLint on).
- Add Drizzle + `pg`, zod, env validation (`web/src/env.ts` parses `process.env` with zod).
- Drizzle schema for all tables in `docs/ARCHITECTURE.md`; scripts `typecheck`, `db:push`.
- Copy-free brand use: serve `../brand` through a symlink `web/public/brand → ../../brand` (or a build step) — do not duplicate files.
- Symlink env: `ln -s ../.env.local web/.env.local` (one secrets file for app + scripts).
- Password login (`APP_PASSWORD`) with signed cookie middleware.
- Dockerfile on the Playwright base image; `.dockerignore`.
- [x] `pnpm dev` shows a login page, then an empty "Months" page. (Confirmed by Vivek 2026-10-02.)
- [x] `pnpm typecheck` passes; `pnpm db:push` creates tables on Neon.
- [x] `docker build` succeeds (run from repo root: `docker build -f web/Dockerfile -t deccan-social .`).
**Notes:** 2026-10-02 plan (branch `t-01-scaffold`):
1. `pnpm` is not installed on the Mac — enable it with `corepack enable` (or `npm i -g pnpm`) first.
2. Scaffold `web/` with create-next-app (TS, App Router, src/, no Tailwind, ESLint); symlink `web/.env.local → ../.env.local` and `web/public/brand → ../../brand`.
3. `src/env.ts` (zod-parsed env), `src/db/schema.ts` (tables from ARCHITECTURE.md) + `src/db/client.ts`, drizzle config, scripts `typecheck` and `db:push`.
4. Login: `/login` page + server action checking `APP_PASSWORD`, signed cookie via `SESSION_SECRET` (small `lib/session.ts`), middleware redirecting to `/login`; empty `/months` page.
5. Dockerfile (Playwright base image) + `.dockerignore`.
Risks: Next.js middleware runs on the edge runtime, so signing must use Web Crypto, not Node `crypto`. `db:push` writes to the real Neon DB (fine, it is empty).
**Built 2026-10-02:** Next.js 16 (middleware is now `proxy.ts`), pnpm 12.8.1 (installed via npm -g), `src/env.ts` skips validation only during `next build` so Docker builds need no secrets, Dockerfile builds from the repo root and copies `brand/` in place of the symlink. Sharp's build script is still disabled in `pnpm-workspace.yaml` — revisit in T-02.
Higgsfield credit: Vivek added $5 (~125 images at $0.04). Not used in T-01; be frugal in T-05 (n=1 tests first).

### T-01b · UI foundation — `done` · 30m
Read `docs/UI.md` first.
- Install Tailwind v4 + shadcn/ui in `web/` (verify current steps for Next 16 at ui.shadcn.com); lucide-react; sonner.
- Map shadcn variables to brand tokens in `globals.css`; load Fraunces + League Spartan from `brand/fonts` via `next/font/local`.
- Add base components: button, card, input, textarea, badge, dialog, tabs, checkbox, select, sonner.
- App shell: header with `wordmark-color.svg`, nav (Months, Library), sign out; restyle login and months pages with it.
- [x] Login and Months pages use the shell and brand theme; focus rings visible. (Confirmed by Vivek 2026-10-02; login logo moved above the card.)
- [x] No hex colours or font names hardcoded in components.
- [x] `pnpm typecheck` and `pnpm lint` pass.
**Notes:** 2026-10-02 (branch `t-01b-ui-foundation`)
- Install that worked: add `tailwindcss @tailwindcss/postcss postcss`, `postcss.config.mjs`, `@import "tailwindcss"` in globals.css, then `pnpm dlx shadcn@latest init -t next -b radix -p nova -y --pointer` (init refuses to run without Tailwind; it asks for a preset unless `-p` is given), then `shadcn add card input textarea badge dialog tabs checkbox select sonner label`.
- The new shadcn output imports `cn` from an npm package named `cn` (not `clsx`/`tailwind-merge`) — it is a real dependency, keep it.
- `globals.css` keeps shadcn's `@theme` mapping; the palette points at brand tokens (border = `paper-100` mixed with 8% ink). Dark theme removed; sonner forced to light (next-themes removed).
- Fonts via `next/font/local` through `public/brand/fonts` (Fraunces 600, League Spartan 400/500/700) — computed fonts verified in the browser.
- `typecheck` now runs `next typegen` first so route types exist after a clean `.next`.
- Screens: `(app)` route group with `AppHeader` (wordmark, Months/Library nav, sign out); `/months` and a placeholder `/library` use it; login restyled.

### T-02 · Renderer — `done` · 75m
Approach decided in ADR-009 (alternatives compared). Keep `renderSlide()` behind one function so the engine can be swapped later.
- React components for the 5 templates (+ carousel cover/inner/CTA), footer and wordmark, porting `brand/templates/*.html` 1:1 using `brand/templates.css` classes.
- `renderSlide(slide, post) → Buffer (JPEG)`: build full HTML (inline tokens.css, templates.css, fonts as data URIs), Playwright → screenshot `.dp-post` → sharp JPEG q92. Reuse one browser instance.
- Dev page `/dev/templates` rendering each template with sample data.
- [x] Each render matches its `brand/templates/*.png` reference (eyeball side by side). (Agent compared festival, exhibition, cover, CTA by screenshot — near pixel-identical; Vivek confirmed `/dev/templates` 2026-10-02.)
- [x] 1:1 (`dp-square`) works for festival and day-of.
- [x] Long hero text (3 lines) does not overflow — reduce font or clamp lines.
**Notes:** 2026-10-02 plan (branch `t-02-renderer`):
1. Add `playwright` pinned to 1.63.0 (matches the Dockerfile image) and download local Chromium. Playwright can screenshot straight to JPEG, so sharp is not needed — leave its build script disabled.
2. `web/src/lib/render/`: `types.ts` (zod `RenderInput`), `templates/*.tsx` (one file per template, ported 1:1 from `brand/templates/*.html`) + `Footer.tsx`, `document.ts` (React → HTML string, inlines tokens.css, templates.css, fonts and logos as data URIs), `browser.ts` (one shared Chromium), `renderSlide.ts` (the single swappable entry point).
3. Hero fit: after load, shrink any `[data-fit-lines]` text until it fits its line limit (floor ~56px), so 3-line heroes never overflow.
4. Square (`dp-square`, 1080 high) variants for festival and day-of: re-position the absolute-placed blocks.
5. `/api/dev/render/[template]` returns the JPEG (404 in production); `/dev/templates` shows every template as an `<img>` next to its `brand/templates/*.png` reference.
Risks: `react-dom/server` inside a Next route may be blocked — fall back to string templates if so. Local Chromium download (~150 MB) is needed once on the Mac.
**Built 2026-10-02:**
- `lib/render/` = `types.ts` (zod `RenderInput`), `templates/*` (7 templates + Footer + Canvas helpers), `document.ts`, `browser.ts`, `brandFiles.ts`, `renderSlide.ts` (the one entry point), `samples.ts`. ~150 ms per slide after warm-up. Sharp not used (Playwright writes the JPEG).
- Next.js blocks `react-dom/server` in app code, so `document.ts` loads it at run time with `import(/* turbopackIgnore: true */ …)`; `brandFiles.ts` also needs a `turbopackIgnore` on `process.cwd()` (Turbopack can't follow the brand symlink). `playwright` is in `serverExternalPackages`. If this gets fragile, move rendering into a small Node script/worker (P2-01).
- Functions sent into the page (`shrinkTextToFit`) must have no inner named functions (tsx adds `__name`).
- Missing photo → plain fruit-tint block (looks empty; T-05 decides the fallback). Missing event logo → box omitted (never invent). Heroes that need > 3 lines shrink to a 40px floor — T-03 should cap hero length (~60 chars) in the plan schema.
- Dev only: `/api/dev/render/[sample]` (no login required, 404 in production) and `/dev/templates` (login required).
- Not yet tested: rendering inside the Docker image (Chromium + fonts) — do it in T-09.


### T-03 · Calendar → plan (Claude) — `done` · 60m
- `schemas/plan.ts`: zod `MonthPlan` (posts with slides, captions, photo_tags, artwork_prompt, rationale). Convert with `z.toJSONSchema` for the tool `input_schema`.
- `lib/claude.ts planMonth(pdf)`: PDF as a `document` block, system prompt built from `docs/BRAND.md` voice + template rules, `tool_choice` forced; validate with zod.
- Upload page → R2 → month row → background plan → posts/slides rows.
- [x] `samples/october-2026-calendar.pdf` produces a sensible plan (Dussehra 20 Oct, exhibitions with exact dates, 1–2 carousels). (6 posts, facts copied exactly; run twice: once needed a correction round, once passed first time.)
- [x] Invalid output fails loudly with a readable error on the month page. (Rule messages verified on a doctored plan; month page shows the message with a "Plan again" button — Vivek approved merge 2026-10-03.)
**Notes:** 2026-10-02 plan (branch `t-03-plan`):
1. Docs first (Vivek's request): `docs/CONTENT-LIMITS.md` (every character/count limit and why) and `samples/calendar-template.md` (fill-in calendar template). Code constants live in `web/src/schemas/limits.ts`; the doc must mirror it.
2. `schemas/plan.ts`: zod `MonthPlan` using the limits (kind → template derived by code, carousel shape rules, dates inside the month). 
3. `lib/claude.ts planMonth(pdf)`: PDF as a `document` block; **structured outputs** (`output_config.format` via `zodOutputFormat`) instead of the forced `tool_choice` in `docs/integrations/other-services.md` — `claude-sonnet-5-5` returns 400 for forced tool use. Validate with the strict zod schema; on limit violations retry once with the problems fed back; refusal/max_tokens give readable errors. System prompt built from BRAND voice + limits (`lib/planPrompt.ts`).
4. `lib/r2.ts` (S3 client), `lib/months/*` (create month, save plan rows, run plan job via `after()`), `POST /api/months` (multipart PDF + month), `POST /api/months/[id]/plan` (plan again).
5. UI: `/months` list + upload dialog; `/months/[id]` with status, error message, planned posts table, polling while planning.
Risks: Claude cost per plan (a few cents; test n=1); long-running job inside the Next process (fine on a single Fly machine); structured-output schema subset (SDK strips unsupported constraints, so strict limits are enforced by our own validation + retry).
**Built 2026-10-02:**
- Docs: `docs/CONTENT-LIMITS.md` (limits), `samples/calendar-template.md` (fill-in calendar). Code: `schemas/{limits,plan,planRules}.ts`, `lib/{claude,planPrompt,r2}.ts`, `lib/months/*`, `components/months/*`, `app/api/months/**`, `/months` and `/months/[id]`. Decision: ADR-010.
- Real run (Neon + R2 + Claude): upload → month row → `after()` job → posts and slides saved → status `planned`. Test month deleted afterwards (its PDF stays in R2 under `calendars/<id>.pdf`).
- New column `months.status_updated_at` (pushed). "Plan again" works for failed months and for ones stuck in "planning" over 10 minutes.
- Not done / later: no R2 delete helper; the posts table is read-only (T-06 builds the review page); `after()` job dies if the server restarts mid-plan (handled by the stuck-job rule; real queue is P2-01).
- Neon prints a pg warning about `sslmode=require`; harmless now, fix by using `sslmode=verify-full` in `DATABASE_URL` when convenient.


### T-03b · CI pipeline — `done` · 15m
Read `docs/CICD.md`. The workflow `.github/workflows/ci.yml` is already written.
- Push and watch the run (`gh run watch`); fix anything red (versions of actions, lint errors, build env).
- Turn on branch protection for `main` (GitHub → Settings → Branches/Rules): require the `Typecheck, lint, build` and `Docker image builds` checks. Vivek does this in the GitHub UI if `gh` lacks permission.
- Add a CI status badge to `README.md`.
- [x] Both jobs green on `main`. (PR #1 run: both green first time, ~4 min; the earlier `main` push run was green too.)
- [x] Branch protection requires both checks. (Applied 2026-10-03 via `gh api`: required checks `Typecheck, lint, build` + `Docker image builds`, force-push and deletion blocked, admins NOT enforced so direct pushes by the owner still work.)
**Notes:** 2026-10-03 plan (branch `t-03b-ci`): push the branch and open a PR (the workflow runs on PRs and on pushes to `main`), watch the run with `gh run watch`, fix anything red, add the README badge, merge, confirm `main` is green, then set branch protection (try `gh api`; otherwise Vivek does it in the UI). Risk: first run may fail on action versions or on the `public/brand` symlink in a clean checkout.
Badge added to README.

### T-03c · AI cost tracking + cheaper Claude calls — `done` · 40m
Read ADR-012 and ADR-013. Prices to verify at the start: https://platform.claude.com/docs/en/about-claude/pricing and …/build-with-claude/prompt-caching (as of 2026-10-03: Sonnet 5.5 $2/$10 per MTok in/out, Haiku 4.5 $1/$5; cache read 0.1× input, 5-min cache write 1.25×; minimum cacheable prompt: Sonnet 5.5 512 tokens, Haiku 4.5 4,096).

**Tracking**
- Table `ai_calls`: id, month_id (nullable), post_id (nullable), purpose (`plan_month` · `plan_fix` · `rewrite_post` · …), model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, latency_ms, status (`ok` · `error` · `refused` · `cut_off`), error, created_at. Generate the migration (`drizzle-kit generate`).
- `lib/ai/prices.ts`: one price table per model (input, output, cache read, cache write); unknown model → log a warning and use the most expensive known price.
- `lib/ai/claude.ts`: one wrapper `callClaude({ purpose, monthId?, postId?, ...params })` that every Claude call goes through; it times the call, reads `response.usage`, computes cost and inserts the row (also on errors). Move `planMonth` onto it.
- `lib/budget.ts`: `spentThisMonth()` = Claude (`ai_calls`) + Higgsfield (`generations`) in INR via `USD_INR_RATE`; `canSpend(estimateUsd)`. Rename `MONTHLY_IMAGE_BUDGET_INR` → `MONTHLY_AI_BUDGET_INR` in env.ts, `.env.example` and `.env.local` (same value 1500).
- Month page: "AI spend this month: ₹X of ₹1,500 (Claude ₹a · artwork ₹b)".

**Cheaper calls**
- Prompt caching: `cache_control` on the system prompt and on the calendar PDF block, so the correction call reads both at 0.1×. Keep `effort` identical between the first call and the retry (changing it invalidates the cache).
- Retry only what's broken: when limits fail, send the problem list and ask for corrected versions of the failing posts only (by index), then merge them into the plan. Do not ask for the whole plan again.
- `CLAUDE_MODEL_LIGHT=claude-haiku-4-5` (new env var) for small jobs: single-post rewrites in T-06 send only that post's JSON + the voice/limit rules, never the PDF.
- Effort: run the sample October calendar at `effort: "low"` and `"medium"`; keep `low` if the plan is as good (note result + token counts here).
- [x] Every Claude call writes an `ai_calls` row, including failures.
- [x] Month page shows AI spend split Claude / artwork.
- [x] Retry call shows cache reads > 0 in `ai_calls`. (Forced retry: 4,542 cache-read tokens, cost $0.025.)
- [x] A retry asks only for broken posts.
**Notes:** 2026-10-03 plan (branch `t-03c-ai-cost`). Prices re-verified 2026-10-03 on the pricing page: Sonnet 5.5 $2 in / $10 out / $2.50 cache write (5m) / $0.20 cache read; Haiku 4.5 $1 / $5 / $1.25 / $0.10; min cacheable prompt Sonnet 5.5 512 tokens, Haiku 4.5 4,096. Changing `effort` or `output_config.format` between calls invalidates the cached *message* blocks, so the retry keeps both identical.
1. Env (done): `MONTHLY_IMAGE_BUDGET_INR` → `MONTHLY_AI_BUDGET_INR` and `CLAUDE_MODEL_LIGHT` added to `.env.local` (targeted edit, names only printed), `env.ts` updated; `.env.example` already had them.
2. Migrations first: baseline (not reset). Generate `0000` from the current schema, run a one-off `scripts/baseline-migrations.ts` that records it as applied in Neon (nothing dropped), then add `ai_calls`, generate `0001`, add `db:generate` / `db:migrate`, remove `db:push`, update `docs/CICD.md` stage 2.
3. `lib/ai/prices.ts`, `lib/ai/callClaude.ts` (times, prices and logs every call, also failures; logging errors never break the call), move `planMonth` + prompt into `lib/ai/`.
4. Cheaper retry: first call = system prompt + calendar PDF both with `cache_control`; on limit problems ask for corrected versions of only the failing posts (same output format and effort so the cache holds), merge by index, re-check the whole plan. Problems that are not about one post (wrong month, no posts) still fail loudly.
5. `lib/budget.ts` (Claude + Higgsfield, INR, IST calendar month) and the spend line on the month page.
6. Effort test on the October sample at `low` and `medium` (about 10–20 cents approved by Vivek); keep `low` if the plan is as good. A scripted test forces a retry to prove cache reads > 0.
**Built 2026-10-03:**
- Migrations: baselined (nothing dropped); `0000_baseline.sql`, `0001_ai_calls.sql`; scripts `db:generate`, `db:migrate`, `db:baseline`; `db:push` removed; `docs/CICD.md` + `CLAUDE.md` updated.
- Code: `lib/ai/{prices,callClaude,planMonth,planPrompt}.ts`, `lib/budget.ts`, `components/months/AiSpendLine.tsx`. `planMonth` now caches the system prompt and the PDF; the fix call asks for only the broken posts and merges them (whole-plan problems like a wrong month fail immediately).
- Measured (Sonnet 5.5, October sample, real calls): first call ≈ $0.048–0.054 (3.6–5.3k output tokens, 4.5k cached write). Old full retry ≈ $0.058; new post-only retry ≈ $0.025 (4.5k cache read). `canSpend` and a failed-call row ($0) verified.
- **Effort test:** `low` 3,643 out tokens / $0.048 vs `medium` 5,264 / $0.054 — a saving under 1 cent per plan, but `low` dropped the middle day of the Dubai expo (boxes 4 and 6 Nov only) and left one LinkedIn caption 2 characters short (would trigger a fix call). **Kept `medium`** (facts outrank a cent). Changing effort between calls did not break the cache for the PDF/system prefix on this model.
- `CLAUDE_MODEL_LIGHT` is in env and `.env.example`; first used by `rewrite_post` in T-06 (not wired yet).
- Spend line shows month-to-date across all months (IST calendar month); today's test calls were ₹11.


### T-04 · Photo library — `todo` · 30m
- `/library`: upload (multi-file) to R2 with kind, tags (fruit, category), people_ok checkbox; grid with filters; delete.
- Seed with `brand/sample-photos/*` (script `pnpm seed:library`).
- `pickAsset(tags)` returns best tag match or null.
- [ ] Seeded photos appear with tags; picking by tags works.
**Notes:**

### T-05 · Higgsfield artwork — `todo` · 60m
Read `docs/integrations/higgsfield.md` first.
- `lib/higgsfield.ts generateArtwork(slide, n)`: prompt = slide.artwork_prompt + BRAND house style; n parallel `subscribe` calls, idempotency `slideId:variant`; copy each result URL to R2 immediately; save `assets` (source `higgsfield`) + `generations` (cost).
- Use `lib/budget.ts` from T-03c: `canSpend()` before every generation, so Claude + artwork together stay under `MONTHLY_AI_BUDGET_INR`; record each image in `generations` with its cost.
- Picture step: library hit → use it; else generate n variants, pick variant 1 by default.
- Handle `failed` / `nsfw` (not charged): retry once with a softened prompt, else leave slide on the no-photo fallback.
- [ ] A slide with no library match gets n artwork variants saved in R2 and logged with cost.
- [ ] Budget cap stops generation and shows a clear message.
- [ ] Never sends faces/deities/text in prompts (house style appended every time).
**Notes:**

### T-06 · Review page — `todo` · 60m
- `/months/[id]`: feed grid by date; per post: slides carousel, captions (IG/LinkedIn tabs), status chip, rationale.
- Actions: Approve · Edit text (eyebrow/hero/sub/info/body, captions) → re-render · Swap artwork variant · Regenerate artwork (budget-checked) · Request changes with note → `rewritePost()` → re-render. "Approve all" for remaining.
- Progress banner while planning/generating/rendering (poll every 3s).
- [ ] Every action persists and re-renders only the affected post.
- [ ] Spend shown on the page.
**Notes:**

### T-07 · Approval email — `todo` · 30m
- `lib/email.ts`: Resend, subject "Your <Month> posts are ready (N posts)", thumbnails (R2 URLs) + button to review page. Sent when rendering completes.
- [ ] Email arrives at `REVIEWER_EMAIL` with working images and link.
**Notes:**

### T-08 · Month pack — `todo` · 30m
- `GET /api/months/[id]/pack`: zip of approved posts: `YYYY-MM-DD_<post-id>/slide-NN.jpg`, `captions.md` (per post: date, platforms, IG + LinkedIn captions), `schedule.csv` (date, time, post, platforms, files).
- [ ] Zip opens on macOS; files in date order.
**Notes:**

### T-09 · Deploy + October end-to-end — `todo` · 45m
Includes CI/CD stages 2–3 from `docs/CICD.md`: generated Drizzle migrations + `release_command`, and the `deploy` job with a scoped Fly deploy token.
- Fly app, secrets, deploy; run the real October calendar; approve; download pack.
- [ ] Production URL works end to end; STATUS.md records the URL.
**Notes:**

## Backlog (after SLC — see roadmap)

- P2-01 BullMQ worker process + Redis; move background jobs into it
- P2-02 Instagram Graph API publishing (single + carousel), delayed jobs at post time
- P2-03 T-2 reminder emails for unapproved posts; failure alerts
- P3-01 Magic-link users and roles (admin, reviewer)
- P3-02 Brand kit editor (versioned `brand_kit` table) — templates read tokens from DB
- P3-03 LinkedIn page posting (after API approval); until then email handoff
- P3-04 Curated illustration library for festival figures
- P4-01 Pull Instagram insights; rank templates/fruits; feed into planning prompt
- Apply for LinkedIn Community Management API access (start early — slow approval)
