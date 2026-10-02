import { gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiCalls, generations } from "@/db/schema";
import { env } from "@/env";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Start of the current calendar month in India (IST), as a UTC instant. Spend resets on the 1st, IST.
function startOfThisMonthIst(): Date {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  return new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), 1) - IST_OFFSET_MS);
}

export type AiSpend = { claudeInr: number; artworkInr: number; totalInr: number; capInr: number };

// Total AI spend this calendar month (Claude from ai_calls + Higgsfield artwork from generations) in rupees.
export async function spentThisMonth(): Promise<AiSpend> {
  const since = startOfThisMonthIst();
  const [claude] = await db.select({ usd: sql<string>`coalesce(sum(${aiCalls.costUsd}), 0)` }).from(aiCalls).where(gte(aiCalls.createdAt, since));
  const [artwork] = await db.select({ usd: sql<string>`coalesce(sum(${generations.costUsd}), 0)` }).from(generations).where(gte(generations.createdAt, since));

  const claudeInr = Number(claude.usd) * env.USD_INR_RATE;
  const artworkInr = Number(artwork.usd) * env.USD_INR_RATE;
  return { claudeInr, artworkInr, totalInr: claudeInr + artworkInr, capInr: env.MONTHLY_AI_BUDGET_INR };
}

// True if a call expected to cost `estimateUsd` still fits under this month's cap. Use before paid calls.
export async function canSpend(estimateUsd: number): Promise<boolean> {
  const spend = await spentThisMonth();
  return spend.totalInr + estimateUsd * env.USD_INR_RATE <= spend.capInr;
}
