# Higgsfield API

Verified 2026-10-01 from the official docs. Re-check model ids and prices in the console before T-05.

- Docs: https://docs.higgsfield.ai/docs/quickstart · SDK: https://docs.higgsfield.ai/docs/how-to/sdk · Webhooks: https://docs.higgsfield.ai/docs/how-to/webhooks · Billing: https://docs.higgsfield.ai/docs/concepts/billing-and-retention
- Console (keys, model catalogue, per-model params and prices): https://console.higgsfield.ai
- Pricing overview: https://open.higgsfield.ai

## Auth
API key id + secret. REST header: `Authorization: Key <id>:<secret>`. Node SDK reads credentials as `"<id>:<secret>"` → our env `HF_CREDENTIALS`.

## Node SDK
```bash
pnpm add @higgsfield/client
```
```ts
import { config, higgsfield } from "@higgsfield/client/v2";
config({ credentials: process.env.HF_CREDENTIALS });
const result = await higgsfield.subscribe("higgsfield-ai/soul/v2/standard", {
  input: { prompt: "…" },
  withPolling: true,
});
const url = result.images?.[0]?.url;
```

## REST (if the SDK misbehaves)
- Base `https://api.higgsfield.ai`
- Submit: `POST /<model-path>` (e.g. `/higgsfield-ai/soul/v2/standard`) with headers `Authorization`, `Content-Type: application/json`, `Idempotency-Key: <uuid>`; body `{ "prompt": "…" }` + model-specific params.
- Poll: `GET /requests/{request_id}/status` → `status` ∈ `queued | completed | failed | nsfw | canceled`; result `images[].url`.

## Rules that matter to us
- Outputs are kept **at least 7 days** then may be deleted → copy every result to R2 immediately.
- `failed` and `nsfw` requests are **not charged** (reserved credits refunded).
- Model-specific params (aspect ratio, resolution, seeds) live on each model's page in the console — check the chosen model's schema and ask for portrait 4:5 or 3:4 if supported; otherwise crop to 1080 × 1350 with sharp (`fit: cover`, `position: attention`).
- Use an idempotency key per `slideId:variant` so retries don't double-bill.

## Open (verify in T-05)
- [ ] Final model choice (photo-real food look) and its price → `HIGGSFIELD_MODEL`, `HIGGSFIELD_COST_PER_IMAGE_USD`.
- [ ] Supported aspect-ratio parameter name for that model.
- [ ] Whether the response includes actual cost (prefer it over the configured estimate).
