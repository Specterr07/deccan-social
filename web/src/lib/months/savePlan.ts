import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";
import { DEFAULT_POST_TIME, type PostKind } from "@/schemas/limits";
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
export async function savePlan(monthId: string, plan: MonthPlan): Promise<void> {
  try {
    await db.transaction(async (transaction) => {
      await transaction.delete(posts).where(eq(posts.monthId, monthId)); // slides go too (cascade)
      for (const post of plan.posts) {
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
          status: "draft",
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
        })));
      }
    });
  } catch (error) {
    // Fails on a database outage or a value the table rejects (e.g. a malformed date).
    throw new Error(`Could not save the plan to the database: ${(error as Error).message}`);
  }
}
