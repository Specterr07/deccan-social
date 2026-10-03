import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";

// Sets a post to "needs_image" while any of its required images is empty, and back to "draft" once all are filled.
// Only touches draft / rendered / needs_image, so an approved or rendered post is never knocked backwards by accident.
export async function refreshPostImageStatus(postId: string): Promise<void> {
  try {
    const postSlides = await db.select().from(slides).where(eq(slides.postId, postId));
    const hasEmptySlot = postSlides.some((slide) => slide.requiredImageKind && !slide.requiredImageAssetId);
    const [post] = await db.select({ status: posts.status }).from(posts).where(eq(posts.id, postId));
    if (!post) return;

    if (hasEmptySlot && (post.status === "draft" || post.status === "rendered")) await db.update(posts).set({ status: "needs_image" }).where(eq(posts.id, postId));
    if (!hasEmptySlot && post.status === "needs_image") await db.update(posts).set({ status: "draft" }).where(eq(posts.id, postId)); // renderPost then makes it "rendered"
  } catch (error) {
    // The database may be down; the upload itself already succeeded, so just log it.
    console.error(`Could not refresh the image status of post ${postId}:`, error);
  }
}
