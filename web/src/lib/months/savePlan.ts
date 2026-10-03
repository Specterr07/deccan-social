import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";
import { DEFAULT_POST_TIME, type PostKind } from "@/schemas/limits";
import { findAssetByName } from "@/lib/library/queries";
import type { MonthPlan, PlanSlide } from "@/schemas/plan";

// Which template draws each kind of post (see docs/ARCHITECTURE.md data model).
const TEMPLATE_BY_KIND: Record<PostKind, string> = {
  festival: "festival",
  day_of: "day_of",
  exhibition: "exhibition",
  informative: "info_carousel",
  bts: "behind_the_scenes",
};

// A calendar may name an exact library image for a required slot. Link it only on an exact name match;
// an unknown name leaves the slot empty (never guess, ADR-014).
async function resolveLibraryImage(slide: PlanSlide): Promise<string | null> {
  const name = slide.required_image?.library_name;
  if (!name) return null;
  const asset = await findAssetByName(name);
  if (!asset) console.warn(`The calendar names the library image "${name}" but it does not exist; the slot stays empty.`);
  return asset?.id ?? null;
}

// Replaces the month's posts and slides with the new plan, all-or-nothing.
// A transaction means a crash half-way never leaves a month with only some of its posts.
export async function savePlan(monthId: string, plan: MonthPlan): Promise<void> {
  try {
    // Look up named library images first (reads), so the transaction below only writes.
    const linkedAssets = await Promise.all(plan.posts.map((post) => Promise.all(post.slides.map(resolveLibraryImage))));

    await db.transaction(async (transaction) => {
      await transaction.delete(posts).where(eq(posts.monthId, monthId)); // slides go too (cascade)
      for (const [postIndex, post] of plan.posts.entries()) {
        // A post waits for images while any required slot has no picture yet.
        const hasEmptySlot = post.slides.some((slide, slideIndex) => slide.required_image && !linkedAssets[postIndex][slideIndex]);
        const [savedPost] = await transaction.insert(posts).values({
          monthId,
          date: post.date,
          time: post.time ?? DEFAULT_POST_TIME,
          kind: post.kind,
          template: TEMPLATE_BY_KIND[post.kind],
          fruit: post.fruit,
          aspect: post.aspect,
          platforms: post.platforms,
          captionInstagram: post.caption_instagram,
          captionLinkedin: post.caption_linkedin,
          rationale: post.rationale,
          status: hasEmptySlot ? "needs_image" : "draft",
        }).returning({ id: posts.id });

        await transaction.insert(slides).values(post.slides.map((slide, index) => ({
          postId: savedPost.id,
          idx: index,
          templateVariant: slide.variant,
          eyebrow: slide.eyebrow,
          hero: slide.hero,
          sub: slide.sub,
          body: slide.body,
          details: slide.dates || slide.venue || slide.stand ? { dates: slide.dates, venue: slide.venue, stand: slide.stand } : null,
          checklist: slide.checklist ?? null,
          photoTags: slide.photo_tags,
          artworkPrompt: slide.artwork_prompt,
          requiredImageKind: slide.required_image?.kind,
          requiredImageDescription: slide.required_image?.description,
          requiredImageLibraryName: slide.required_image?.library_name,
          requiredImageAssetId: linkedAssets[postIndex][index],
        })));
      }
    });
  } catch (error) {
    // Fails on a database outage or a value the table rejects (e.g. a malformed date).
    throw new Error(`Could not save the plan to the database: ${(error as Error).message}`);
  }
}
