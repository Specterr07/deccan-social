# Other integrations — notes to verify when each task starts

Record what you verify (date + link) in this file or a dedicated file per service.

## Claude API (T-03)
- SDK `@anthropic-ai/sdk`; model from `CLAUDE_MODEL`.
- Send the calendar PDF as a `document` content block (base64, `application/pdf`).
- Structured output: `output_config: { format: zodOutputFormat(schema) }` (from `@anthropic-ai/sdk/helpers/zod`) on `messages.create`, then validate the JSON text with our own strict checks. **Do not use forced `tool_choice`** — `claude-sonnet-5-5` (and Opus 5.5 / Fable 5.1) return HTTP 400 for it. Verified 2026-10-02 against the SDK docs; a real plan call costs ~$0.05–0.12 (about 4.5k input + 5k output tokens per attempt).
- Docs: https://docs.claude.com

## Cloudflare R2 (T-01/T-04)
- S3-compatible; use `@aws-sdk/client-s3` with endpoint `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`.
- Enable public access (r2.dev or custom domain) → `R2_PUBLIC_BASE_URL`; Instagram publishing (Phase 2) needs public JPEG URLs.

## Resend (T-07)
- SDK `resend`; `from` must be a verified domain (or Resend's onboarding sender for testing to your own address).

## Playwright rendering (T-02)
- `playwright-core` + Chromium in the Docker image (base `mcr.microsoft.com/playwright`). Locally: `pnpm exec playwright install chromium`.
- Keep one browser per process; new page per render; wait for `document.fonts.ready` before the screenshot.

## Instagram Graph API (Phase 2)
- Needs an Instagram Business/Creator account linked to a Facebook Page and a Meta app with content-publishing permission. Media must be at a public URL (JPEG). Carousels = child containers then a parent. Verify current limits before building.

## LinkedIn (Phase 3)
- Company page posting needs Community Management API access (application + review). Apply early; until approved, LinkedIn goes out via the month pack.
