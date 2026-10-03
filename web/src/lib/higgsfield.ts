import { createHash } from "node:crypto";
import { env } from "@/env";

// The only module that talks to Higgsfield (REST, see docs/integrations/higgsfield.md). It makes ONE image and returns its URL;
// saving it, pricing it and the budget check live in lib/artwork/.
const API_BASE = "https://api.higgsfield.ai";
const POLL_EVERY_MS = 2000;
const GIVE_UP_AFTER_MS = 2 * 60 * 1000;
// Portrait 3:4 at 1080p: close to the 4:5 posts (templates crop with object-fit: cover). Prices checked in T-05.
const IMAGE_SETTINGS = { resolution: "1080p", aspect_ratio: "3:4", batch_size: 1, enhance_prompt: false } as const;

export type HiggsfieldResult =
  | { outcome: "completed"; requestId: string; imageUrl: string }
  | { outcome: "failed" | "nsfw" | "canceled"; requestId: string } // failed and nsfw are not charged
  | { outcome: "timeout"; requestId: string }; // still running when we gave up: it may yet be charged

// Higgsfield wants a UUID as idempotency key. The same text always gives the same UUID, so a retry of the
// same slide + variant is the same request and is never billed twice.
export function idempotencyKeyFor(text: string): string {
  const hex = createHash("sha256").update(text).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Key ${env.HF_CREDENTIALS}`, "Content-Type": "application/json" };
}

type SubmitResponse = { request_id?: string; status_url?: string };
type StatusResponse = { status?: string; images?: { url?: string }[] };

// Sends the prompt and waits for the result. Throws a readable error if Higgsfield cannot be reached or rejects the request.
export async function generateImage(prompt: string, idempotencyKey: string): Promise<HiggsfieldResult> {
  let submitted: SubmitResponse;
  try {
    const response = await fetch(`${API_BASE}/${env.HIGGSFIELD_MODEL}`, {
      method: "POST",
      headers: { ...authHeaders(), "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ prompt, ...IMAGE_SETTINGS }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
    submitted = await response.json();
  } catch (error) {
    // Wrong credentials, no credit left, a rejected parameter or a network drop all land here.
    throw new Error(`Higgsfield did not accept the request: ${(error as Error).message}`);
  }
  if (!submitted.request_id) throw new Error("Higgsfield did not return a request id.");

  const statusUrl = submitted.status_url ?? `${API_BASE}/requests/${submitted.request_id}/status`;
  const deadline = Date.now() + GIVE_UP_AFTER_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_EVERY_MS));
    let status: StatusResponse;
    try {
      const response = await fetch(statusUrl, { headers: authHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      status = await response.json();
    } catch (error) {
      // A single failed poll is not fatal: the image may still finish, so keep waiting until the deadline.
      console.warn(`Higgsfield status check failed for ${submitted.request_id}:`, (error as Error).message);
      continue;
    }
    if (status.status === "completed") {
      const imageUrl = status.images?.[0]?.url;
      if (!imageUrl) throw new Error(`Higgsfield finished request ${submitted.request_id} but returned no image.`);
      return { outcome: "completed", requestId: submitted.request_id, imageUrl };
    }
    if (status.status === "failed" || status.status === "nsfw" || status.status === "canceled") {
      return { outcome: status.status, requestId: submitted.request_id };
    }
  }
  return { outcome: "timeout", requestId: submitted.request_id };
}
