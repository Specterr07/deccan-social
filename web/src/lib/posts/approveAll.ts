import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts } from "@/db/schema";
import { logReview } from "./reviewLog";

export type ApproveAllResult = { ok: true; approved: number; skippedNeedImage: number } | { ok: false; status: number; message: string };

// Approves every post that is "Ready for review". Posts waiting for an image are skipped (and counted), never approved.
export async function approveAll(monthId: string): Promise<ApproveAllResult> {
  try {
    const approved = await db.update(posts).set({ status: "approved" }).where(and(eq(posts.monthId, monthId), eq(posts.status, "rendered"))).returning({ id: posts.id });
    for (const post of approved) await logReview(post.id, "approve");
    const waiting = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.monthId, monthId), eq(posts.status, "needs_image")));
    return { ok: true, approved: approved.length, skippedNeedImage: waiting.length };
  } catch (error) {
    // Database trouble, or a malformed id in the address.
    console.error(`Approving all posts of ${monthId} failed:`, error);
    return { ok: false, status: 500, message: "We could not approve the posts. Please try again." };
  }
}
