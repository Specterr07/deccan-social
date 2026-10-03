import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";

type PostRow = typeof posts.$inferSelect;
type SlideRow = typeof slides.$inferSelect;

// Writes new words (slide text, captions and optionally the rationale) for a post, all-or-nothing.
// An approved post goes back to "Ready for review": changed words need a fresh look.
export async function saveWords(post: PostRow, editedSlides: SlideRow[], captions: { instagram: string; linkedin: string }, rationale?: string): Promise<void> {
  await db.transaction(async (transaction) => {
    await transaction.update(posts).set({
      captionInstagram: captions.instagram, captionLinkedin: captions.linkedin,
      ...(rationale !== undefined ? { rationale } : {}),
      status: post.status === "approved" ? "rendered" : post.status,
    }).where(eq(posts.id, post.id));
    for (const slide of editedSlides) {
      await transaction.update(slides).set({ eyebrow: slide.eyebrow, hero: slide.hero, sub: slide.sub, body: slide.body, checklist: slide.checklist }).where(eq(slides.id, slide.id));
    }
  });
}
