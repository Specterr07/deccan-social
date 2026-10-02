# Deccan Produce Social Pipeline

Monthly calendar PDF → on-brand Instagram/LinkedIn posts (with captions) → email approval → download pack (later: auto-publish). Built for Deccan Produce, a Mumbai fresh-produce exporter, so any social media person can run their feed.

## Every session starts here

1. Read `docs/STATUS.md` — where the last session stopped, what is next, blockers.
2. Read the task you'll work on in `docs/TASKS.md` (its acceptance criteria are the definition of done).
3. Skim `docs/DECISIONS.md` before changing anything architectural.
4. Follow `docs/SDLC.md` for the task: Plan → Build → Verify → Review → Ship.
5. Before you stop (even mid-task), run the handoff: update `docs/STATUS.md` (+ `docs/TASKS.md`, + a decision record if you made one) and commit. The next session must be able to continue from those files alone.

Slash commands: `/start` (orient + pick the next task), `/handoff` (write status and commit), `/review` (self-review the current diff).

## Map

| Path | What |
| --- | --- |
| `docs/PRD.md` | What we build and why; SLC scope |
| `docs/ARCHITECTURE.md` | Ideal + SLC architecture, data model, flows |
| `docs/BRAND.md` | Design language rules (voice, colour, type, templates) |
| `docs/UI.md` | How app screens are built (shadcn/ui + Tailwind v4, theme mapping, screen components) |
| `docs/CONTENT-LIMITS.md` | Character/count limits per text field (mirrors `web/src/schemas/limits.ts`) |
| `docs/TASKS.md` | Backlog with IDs, status, acceptance criteria |
| `docs/STATUS.md` | Handoff log: current state, next action, session history |
| `docs/DECISIONS.md` | Architecture decision records (ADRs) |
| `docs/SDLC.md` | How work moves from idea to shipped |
| `docs/integrations/` | Verified notes per external API |
| `brand/` | Source of truth for visuals: tokens, CSS, logos, fonts, templates, reference posts |
| `samples/` | Test inputs (sample calendars) and `calendar-template.md`, the fill-in template for the monthly calendar |
| `web/` | The Next.js app (created by task T-01) |

## Hard rules

- **AI never draws text.** Image models make backgrounds/artwork only; all text, logos, dates, event logos and the footer are placed by the HTML templates in `brand/`.
- **Brand comes from `brand/`.** Use `brand/tokens.css` + `brand/templates.css` and the logo SVGs as-is. Never hardcode a colour or font in app code; never retype the wordmark. Target look = `brand/templates/*.png`.
- **Two styling systems, kept apart.** Posts = plain brand CSS (`dp-*`); app screens = shadcn/ui + Tailwind themed from tokens (`docs/UI.md`). Show posts in the app only as rendered JPEGs.
- **Nothing publishes without approval.** Every post needs an explicit approve.
- **Spend is capped.** Every paid image call goes through the budget check and is logged with its cost.
- **Copy facts from the calendar.** Dates, venues, stall numbers are never invented; leave them out if missing.
- **Secrets only in `.env.local`** (never committed). Keep `.env.example` in sync when adding a variable.
- **Small, verified steps.** Typecheck must pass before any commit to `main`.

## Stack (SLC)

Next.js (App Router, TypeScript) in `web/` · shadcn/ui + Tailwind v4 for app screens · Postgres (Neon) + Drizzle · Claude API (planning, copy, captions) · Higgsfield API (artwork) · Playwright (render HTML → JPEG) · Cloudflare R2 (files) · Resend (email) · Docker on Fly.io. Package manager: pnpm.

## Commands (fill in as they exist)

- `cd web && pnpm dev` — run locally
- `cd web && pnpm typecheck` — must pass before commit
- `cd web && pnpm db:push` — apply Drizzle schema

## Conventions

- TypeScript strict. Zod at every boundary (AI output, API input, env).
- Branch per task: `t-05-higgsfield`. Conventional commits: `feat(t-05): …`, `fix:`, `docs:`, `chore:`.
- Keep functions small; one module per external service in `web/src/lib/<service>.ts`.
- Plain, specific English in UI copy; the reviewer may not be technical.
