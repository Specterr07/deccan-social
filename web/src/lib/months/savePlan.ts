import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";
import { DEFAULT_POST_TIME, type PostKind } from "@/schemas/limits";
import type { EntryWithImage } from "@/lib/entries/queries";
import type { MonthPlan } from "@/schemas/plan";

// Which template draws each kind of post (see docs/ARCHITECTURE.md data model).
const TEMPLATE_BY_KIND: Record<PostKind, string> = {
  festival: "festival",
  day_of: "day_of",
  exhibition: "exhibition",
  informative: "info_carousel",
  bts: "behind_the_scenes",
};

// Replaces the month's posts and slides with the new plan, all-or-nothing.
// A transaction means a crash half-way never leaves a month with only some of its posts.
// The entry's own image (event logo / photo) goes into the post's required slot, so a post whose entry has it starts ready.
export async function savePlan(monthId: string, plan: MonthPlan, entries: EntryWithImage[]): Promise<void> {
  try {
    const entryById = new Map(entries.map((entry) => [entry.id, entry]));

    await db.transaction(async (transaction) => {
      await transaction.delete(posts).where(eq(posts.monthId, monthId)); // slides go too (cascade)
      for (const post of plan.posts) {
        const entryImageId = entryById.get(post.entry_id)?.requiredImageAssetId ?? null;
        // A post waits for images while any required slot has no picture yet.
        const hasEmptySlot = post.slides.some((slide) => slide.required_image && !entryImageId);
        const [savedPost] = await transaction.insert(posts).values({
          monthId,
          entryId: post.entry_id,
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
          requiredImageAssetId: slide.required_image ? entryImageId : null,
        })));
      }
    });
  } catch (error) {
    // Fails on a database outage or a value the table rejects (e.g. a malformed date).
    throw new Error(`Could not save the plan to the database: ${(error as Error).message}`);
  }
}
