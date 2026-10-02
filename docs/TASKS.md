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

### T-01b · UI foundation — `doing` · 30m
Read `docs/UI.md` first.
- Install Tailwind v4 + shadcn/ui in `web/` (verify current steps for Next 16 at ui.shadcn.com); lucide-react; sonner.
- Map shadcn variables to brand tokens in `globals.css`; load Fraunces + League Spartan from `brand/fonts` via `next/font/local`.
- Add base components: button, card, input, textarea, badge, dialog, tabs, checkbox, select, sonner.
- App shell: header with `wordmark-color.svg`, nav (Months, Library), sign out; restyle login and months pages with it.
- [ ] Login and Months pages use the shell and brand theme; focus rings visible.
- [x] No hex colours or font names hardcoded in components.
- [x] `pnpm typecheck` and `pnpm lint` pass.
**Notes:** 2026-10-02 (branch `t-01b-ui-foundation`)
- Install that worked: add `tailwindcss @tailwindcss/postcss postcss`, `postcss.config.mjs`, `@import "tailwindcss"` in globals.css, then `pnpm dlx shadcn@latest init -t next -b radix -p nova -y --pointer` (init refuses to run without Tailwind; it asks for a preset unless `-p` is given), then `shadcn add card input textarea badge dialog tabs checkbox select sonner label`.
- The new shadcn output imports `cn` from an npm package named `cn` (not `clsx`/`tailwind-merge`) — it is a real dependency, keep it.
- `globals.css` keeps shadcn's `@theme` mapping; the palette points at brand tokens (border = `paper-100` mixed with 8% ink). Dark theme removed; sonner forced to light (next-themes removed).
- Fonts via `next/font/local` through `public/brand/fonts` (Fraunces 600, League Spartan 400/500/700) — computed fonts verified in the browser.
- `typecheck` now runs `next typegen` first so route types exist after a clean `.next`.
- Screens: `(app)` route group with `AppHeader` (wordmark, Months/Library nav, sign out); `/months` and a placeholder `/library` use it; login restyled.

### T-02 · Renderer — `todo` · 75m
- React components for the 5 templates (+ carousel cover/inner/CTA), footer and wordmark, porting `brand/templates/*.html` 1:1 using `brand/templates.css` classes.
- `renderSlide(slide, post) → Buffer (JPEG)`: build full HTML (inline tokens.css, templates.css, fonts as data URIs), Playwright → screenshot `.dp-post` → sharp JPEG q92. Reuse one browser instance.
- Dev page `/dev/templates` rendering each template with sample data.
- [ ] Each render matches its `brand/templates/*.png` reference (eyeball side by side).
- [ ] 1:1 (`dp-square`) works for festival and day-of.
- [ ] Long hero text (3 lines) does not overflow — reduce font or clamp lines.
**Notes:**

### T-03 · Calendar → plan (Claude) — `todo` · 60m
- `schemas/plan.ts`: zod `MonthPlan` (posts with slides, captions, photo_tags, artwork_prompt, rationale). Convert with `z.toJSONSchema` for the tool `input_schema`.
- `lib/claude.ts planMonth(pdf)`: PDF as a `document` block, system prompt built from `docs/BRAND.md` voice + template rules, `tool_choice` forced; validate with zod.
- Upload page → R2 → month row → background plan → posts/slides rows.
- [ ] `samples/october-2026-calendar.pdf` produces a sensible plan (Dussehra 20 Oct, exhibitions with exact dates, 1–2 carousels).
- [ ] Invalid output fails loudly with a readable error on the month page.
**Notes:**

### T-04 · Photo library — `todo` · 30m
- `/library`: upload (multi-file) to R2 with kind, tags (fruit, category), people_ok checkbox; grid with filters; delete.
- Seed with `brand/sample-photos/*` (script `pnpm seed:library`).
- `pickAsset(tags)` returns best tag match or null.
- [ ] Seeded photos appear with tags; picking by tags works.
**Notes:**

### T-05 · Higgsfield artwork — `todo` · 60m
Read `docs/integrations/higgsfield.md` first.
- `lib/higgsfield.ts generateArtwork(slide, n)`: prompt = slide.artwork_prompt + BRAND house style; n parallel `subscribe` calls, idempotency `slideId:variant`; copy each result URL to R2 immediately; save `assets` (source `higgsfield`) + `generations` (cost).
- `lib/budget.ts`: `canSpend(n)` blocks when the month's spend would pass `MONTHLY_IMAGE_BUDGET_INR`; UI shows spend / cap.
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
