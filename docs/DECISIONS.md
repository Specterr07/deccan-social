# Decisions (ADRs)

Add a new record when a choice would surprise a future reader or is costly to reverse. Format: context → decision → consequences. Never edit an accepted record; supersede it with a new one.

## ADR-001 · Hybrid rendering: AI artwork, code-placed text — accepted 2026-10-01
**Context:** Image models misspell text and drift from brand; posts carry exact dates, emails and event logos.
**Decision:** Image models generate backgrounds/artwork only. HTML templates (brand CSS) place all text, logos and the footer; Playwright renders to JPEG.
**Consequences:** Exact, consistent text; templates must be maintained in code; cheaper image models suffice.

## ADR-002 · Generate the whole month in one batch — accepted 2026-10-01
**Context:** Just-in-time generation creates a deadline every few days; a missed email means a missed post.
**Decision:** Plan, generate and render the whole month after upload; one review sitting. Phase 2 adds T-2 reminders for unapproved posts. Nothing unapproved is ever published.
**Consequences:** Spend happens up front; edits (e.g. stall numbers) re-render single posts.

## ADR-003 · 4:5 default aspect — accepted 2026-10-01
**Decision:** 1080 × 1350 by default; 1:1 when the calendar specifies it.

## ADR-004 · Higgsfield for artwork, in the SLC — accepted 2026-10-01
**Context:** Pay-per-image API with many models, $0.003–$0.10/image listed; failed/nsfw not charged; outputs kept ~7 days.
**Decision:** Higgsfield behind `lib/higgsfield.ts` (model from env), N variants per slide (default 3), results copied to R2 immediately, every call logged with cost, monthly cap ₹1,500 (ceiling ₹2,000).
**Consequences:** Model can change via env; cost is estimated from a configured per-image price until billing data is wired.

## ADR-005 · SLC is one Next.js app without a queue — accepted 2026-10-01
**Context:** ~15 posts/month; one reviewer; build time is tonight.
**Decision:** Background work via `after()` + status polling; no Redis/BullMQ until Phase 2.
**Consequences:** A deploy mid-job can drop work (acceptable; re-run per month). Move to a worker when publishing arrives.

## ADR-006 · Brand lives in `/brand`, generated tokens — accepted 2026-10-01
**Decision:** `brand/tokens.json` is the source; `brand/tokens.css` is generated from it; `brand/templates.css` holds layout classes; the app imports these and never hardcodes colours/fonts. Fonts: Fraunces + League Spartan. Primary green #005F37 from the logo.

## ADR-007 · Docs-as-handoff for AI sessions — accepted 2026-10-01
**Decision:** `CLAUDE.md` (auto-loaded) points every session to `docs/STATUS.md` → `docs/TASKS.md` → `docs/SDLC.md`; sessions end with `/handoff`. `AGENTS.md` points other agents to the same files.
**Consequences:** Continuity doesn't depend on chat history; the docs must be kept current.

## ADR-008 · App UI: shadcn/ui + Tailwind v4, themed from brand tokens — accepted 2026-10-02
**Context:** The app needs accessible dialogs, tabs, menus and forms built fast by AI agents; posts are rendered from plain brand CSS.
**Decision:** App screens use shadcn/ui (copied into `web/src/components/ui/`, Radix-based) on Tailwind CSS v4, with shadcn variables mapped to brand tokens and fonts loaded from `brand/fonts`. Post templates stay plain CSS and are shown in the app only as rendered JPEGs or iframes. Details in `docs/UI.md`.
**Consequences:** Components are owned code (no version lock-in) that agents know well; two styling systems exist, separated by rule. Alternatives rejected: MUI/Mantine (fight the brand look, heavier), hand-written CSS modules (slower to build).

## ADR-009 · Build the renderer (HTML + Playwright) instead of a template API — accepted 2026-10-02
**Context:** Options compared before T-02: (a) our HTML/CSS templates screenshotted by Playwright; (b) Satori/`next/og` (JSX → SVG → PNG, no browser); (c) template-image SaaS — Placid from $19/mo (500 credits), RenderForm $9/mo, Orshot $39/mo, Bannerbear $49/mo; (d) Canva Connect Autofill (needs Canva Pro/Teams/Enterprise + OAuth integration).
**Decision:** Build (a). The 5 templates already exist as HTML/CSS matching the brand kit 1:1; the renderer is ~150 lines; cost is only server RAM.
**Why not the others:** Satori lacks `<style>`/class names, pseudo-elements, `outline` and WOFF2, so every template would be rewritten as inline-styled JSX. SaaS plans eat most of the ₹1,500–2,000 monthly budget meant for artwork, add vendor lock-in, and need templates rebuilt in their editor. Canva autofill is attractive for letting the social media person edit templates visually, but adds OAuth, async exports and plan dependency.
**Revisit:** Phase 3 — if non-developers must edit templates, evaluate Canva Autofill (if Deccan Produce already pays for Canva Pro) against our own brand-kit editor. If Chromium on Fly.io proves painful, a hosted HTML-to-image API can replace `renderSlide()` without touching templates.

## ADR-010 · Plan the month with structured outputs and our own limit checks — accepted 2026-10-02
**Context:** The first plan was to force a tool call (`tool_choice`) so Claude returns schema-shaped JSON. `claude-sonnet-5-5` rejects forced tool use with a 400, and a JSON-schema constraint like `maxLength` cannot express limits that depend on the template.
**Decision:** `planMonth()` uses structured outputs (`output_config.format` from the zod shape, no limits) and validates the answer in code (`schemas/planRules.ts`, numbers in `schemas/limits.ts`, documented in `docs/CONTENT-LIMITS.md`). If limits are broken, Claude gets the problem list once and corrects its plan; after that the month shows a readable error and nothing is saved.
**Consequences:** One source of truth for limits (code + doc); a plan sometimes costs two calls (about 10 cents instead of 5). Server-side refusal fallbacks are not enabled (a calendar refusal is very unlikely; a refusal shows a clear message).

