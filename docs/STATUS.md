# Status — handoff log

> Update this file at the end of every session (`/handoff`). Newest session on top. Keep "Now" short and true.

## Now

- **Phase:** SLC
- **Current task:** none — T-02 (renderer) is next
- **Last thing done:** T-01 done and merged to `main` — Next.js app in `web/`, schema on Neon, password login, Docker image builds.
- **Next action:** Run `/start`, begin T-02 (renderer). Enable sharp's build script in `web/pnpm-workspace.yaml` and add Playwright (match the Dockerfile image tag, currently v1.63.0).
- **Blockers:** None. Brand kit fonts/colours to be signed off by the owner (not blocking).
- **Production URL:** — (set in T-09)

## Session log

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
