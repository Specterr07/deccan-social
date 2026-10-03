import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts } from "@/db/schema";
import { logReview } from "./reviewLog";

export type PostActionResult = { ok: true } | { ok: false; status: number; message: string };

// Approves a drawn post. Refused (409) while it still waits for an image or has not been drawn yet:
// nothing may be published without every required picture (ADR-014).
export async function approvePost(postId: string): Promise<PostActionResult> {
  try {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return { ok: false, status: 404, message: "That post does not exist." };
    if (post.status === "approved") return { ok: true };
    if (post.status === "needs_image") return { ok: false, status: 409, message: "This post still needs an image. Add it first, then approve." };
    if (post.status !== "rendered") return { ok: false, status: 409, message: "This post has not been drawn yet. Please wait a moment and try again." };

    await db.update(posts).set({ status: "approved" }).where(eq(posts.id, postId));
    await logReview(postId, "approve");
    return { ok: true };
  } catch (error) {
    // Database trouble, or a malformed id in the address.
    console.error(`Approving post ${postId} failed:`, error);
    return { ok: false, status: 500, message: "We could not approve this post. Please try again." };
  }
}

// Takes an approval back, so the post is "Ready for review" again.
export async function undoApproval(postId: string): Promise<PostActionResult> {
  try {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return { ok: false, status: 404, message: "That post does not exist." };
    if (post.status !== "approved") return { ok: true };
    await db.update(posts).set({ status: "rendered" }).where(eq(posts.id, postId));
    await logReview(postId, "unapprove");
    return { ok: true };
  } catch (error) {
    console.error(`Undoing the approval of post ${postId} failed:`, error);
    return { ok: false, status: 500, message: "We could not undo the approval. Please try again." };
  }
}
