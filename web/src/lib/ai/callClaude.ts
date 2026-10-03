import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db/client";
import { aiCalls } from "@/db/schema";
import { env } from "@/env";
import { costInUsd, type TokenUsage } from "./prices";

// What the call was for; shown in the cost log and used for per-feature spend later.
export type AiPurpose = "plan_month" | "plan_fix" | "rewrite_post" | "import_pdf";

type CallOptions = Anthropic.MessageCreateParamsNonStreaming & { purpose: AiPurpose; monthId?: string; postId?: string };

const globalForClaude = globalThis as unknown as { anthropic?: Anthropic };
const anthropic = globalForClaude.anthropic ?? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
if (process.env.NODE_ENV !== "production") globalForClaude.anthropic = anthropic;

type CallRecord = {
  purpose: AiPurpose; monthId?: string; postId?: string; model: string; usage: TokenUsage;
  latencyMs: number; status: "ok" | "error" | "refused" | "cut_off"; error?: string;
};

// Writes one ai_calls row. A logging failure must never break the real work, so it is only logged.
async function recordCall(call: CallRecord): Promise<void> {
  const costUsd = costInUsd(call.model, call.usage);
  try {
    await db.insert(aiCalls).values({
      monthId: call.monthId, postId: call.postId, purpose: call.purpose, model: call.model,
      inputTokens: call.usage.inputTokens, outputTokens: call.usage.outputTokens,
      cacheReadTokens: call.usage.cacheReadTokens, cacheWriteTokens: call.usage.cacheWriteTokens,
      costUsd: costUsd.toFixed(6), latencyMs: call.latencyMs, status: call.status, error: call.error,
    });
  } catch (error) {
    // The database may be down; the Claude answer is still valid, so just report it.
    console.error("Could not record the AI call in ai_calls:", error);
  }
  console.info(`Claude ${call.purpose}: ${call.status}, ${call.usage.inputTokens} in / ${call.usage.cacheReadTokens} cached / ${call.usage.outputTokens} out, $${costUsd.toFixed(4)}, ${call.latencyMs}ms`);
}

// EVERY Claude call in the app goes through here, so every call is timed, priced and logged (also failures).
export async function callClaude(options: CallOptions): Promise<Anthropic.Message> {
  const { purpose, monthId, postId, ...params } = options;
  const startedAt = Date.now();
  const noUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create(params);
  } catch (error) {
    // Network drops, an invalid key, rate limits or an overloaded API all land here.
    await recordCall({ purpose, monthId, postId, model: params.model, usage: noUsage, latencyMs: Date.now() - startedAt, status: "error", error: (error as Error).message });
    throw new Error(`The Claude API call failed: ${(error as Error).message}`);
  }

  const status = response.stop_reason === "refusal" ? "refused" : response.stop_reason === "max_tokens" ? "cut_off" : "ok";
  await recordCall({
    purpose, monthId, postId, model: params.model, latencyMs: Date.now() - startedAt, status,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
    },
  });
  return response;
}
