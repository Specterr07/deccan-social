import { and, arrayOverlaps, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assets } from "@/db/schema";
import { PEOPLE_TAGS } from "./assetRules";

// Best library photo for a list of wanted tags, or null if nothing matches. ONLY for automatic pictures:
// required images (event logos, specific photos) are never picked this way (ADR-014).
// Ranking: most matching tags wins, newer breaks a tie. Photos showing people need "people OK" ticked.
export async function pickAsset(wantedTags: string[]) {
  const wanted = wantedTags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  if (wanted.length === 0) return null;

  const candidates = await db.select().from(assets)
    .where(and(eq(assets.kind, "photo"), eq(assets.source, "upload"), arrayOverlaps(assets.tags, wanted)));

  const usable = candidates.filter((asset) => asset.peopleOk || !asset.tags.some((tag) => PEOPLE_TAGS.includes(tag)));
  const scored = usable.map((asset) => ({ asset, score: asset.tags.filter((tag) => wanted.includes(tag)).length }));
  scored.sort((a, b) => b.score - a.score || b.asset.createdAt.getTime() - a.asset.createdAt.getTime());
  return scored[0]?.asset ?? null;
}
