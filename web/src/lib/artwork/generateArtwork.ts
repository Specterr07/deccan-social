import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { assets, generations } from "@/db/schema";
import { env } from "@/env";
import { canSpend } from "@/lib/budget";
import { generateImage, idempotencyKeyFor, type HiggsfieldResult } from "@/lib/higgsfield";
import { uploadObject } from "@/lib/r2";
import { buildArtworkPrompt, buildSoftenedPrompt } from "./houseStyle";

export type ArtworkInput = { slideId: string; scene: string; photoTags: string[] };
export type ArtworkOutcome = { assetIds: string[]; message: string | null }; // message = why fewer pictures than asked, for the month page

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Downloads the finished image and stores it in R2 at once (Higgsfield deletes outputs after about 7 days).
async function copyToStorage(imageUrl: string): Promise<{ url: string; storageKey: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`could not download the picture (HTTP ${response.status})`);
  const contentType = (response.headers.get("content-type") ?? "image/jpeg").split(";")[0];
  const extension = IMAGE_TYPES[contentType] ?? "jpg";
  const storageKey = `artwork/${randomUUID()}.${extension}`;
  return { url: await uploadObject(storageKey, Buffer.from(await response.arrayBuffer()), contentType), storageKey };
}

async function logGeneration(input: ArtworkInput, variant: number, prompt: string, result: HiggsfieldResult, assetId: string | null) {
  // Failed and nsfw requests are not charged. A timeout may still finish and charge, so it is counted to stay under the cap.
  const charged = result.outcome === "completed" || result.outcome === "timeout";
  await db.insert(generations).values({
    slideId: input.slideId, requestId: result.requestId, model: env.HIGGSFIELD_MODEL, prompt, variant, status: result.outcome,
    costUsd: (charged ? env.HIGGSFIELD_COST_PER_IMAGE_USD : 0).toFixed(4), assetId,
  });
}

// Makes one variant: try the brand-styled prompt, and if it fails or is blocked retry ONCE with a plainer prompt.
async function makeVariant(input: ArtworkInput, variant: number): Promise<string | null> {
  const prompts = [buildArtworkPrompt(input.scene), buildSoftenedPrompt(input.photoTags)];
  for (const [attempt, prompt] of prompts.entries()) {
    const result = await generateImage(prompt, idempotencyKeyFor(`${input.slideId}:${variant}:${attempt}`));
    if (result.outcome !== "completed") {
      await logGeneration(input, variant, prompt, result, null);
      if (result.outcome === "timeout") return null; // do not send a second request while the first may still be running
      continue;
    }
    const stored = await copyToStorage(result.imageUrl);
    const [asset] = await db.insert(assets).values({
      name: `artwork-${input.slideId.slice(0, 8)}-v${variant}`, url: stored.url, storageKey: stored.storageKey, kind: "ai",
      tags: input.photoTags, description: input.scene, peopleOk: false, source: "higgsfield",
    }).returning({ id: assets.id });
    await logGeneration(input, variant, prompt, result, asset.id);
    return asset.id;
  }
  return null;
}

// Makes `variantCount` artwork pictures for one slide and saves them (R2 + assets + generations). Never throws:
// a problem on one picture becomes a message, so the rest of the month carries on.
export async function generateArtwork(input: ArtworkInput, variantCount = env.IMAGE_VARIANTS_PER_SLIDE): Promise<ArtworkOutcome> {
  try {
    if (!(await canSpend(variantCount * env.HIGGSFIELD_COST_PER_IMAGE_USD))) {
      return { assetIds: [], message: "The monthly AI budget is used up, so no artwork was made. Raise MONTHLY_AI_BUDGET_INR or wait for next month." };
    }
    const settled = await Promise.allSettled(Array.from({ length: variantCount }, (_, index) => makeVariant(input, index + 1)));
    const assetIds = settled.flatMap((entry) => (entry.status === "fulfilled" && entry.value ? [entry.value] : []));
    const firstError = settled.find((entry) => entry.status === "rejected");
    if (firstError) console.error(`Artwork for slide ${input.slideId} had an error:`, (firstError as PromiseRejectedResult).reason);
    return { assetIds, message: assetIds.length < variantCount ? "Some artwork could not be made; those posts keep a plain background." : null };
  } catch (error) {
    // The prompt was refused (deity words), the budget lookup failed, or the database was unreachable.
    console.error(`Artwork for slide ${input.slideId} failed:`, error);
    return { assetIds: [], message: `Artwork could not be made: ${(error as Error).message}` };
  }
}
