import { db } from "@/db/client";
import { reviews } from "@/db/schema";

// Writes one line of the post's history (approve / edit / request_changes). A logging failure must not undo the action itself.
export async function logReview(postId: string, action: "approve" | "unapprove" | "edit" | "request_changes", note?: string): Promise<void> {
  try {
    await db.insert(reviews).values({ postId, action, note });
  } catch (error) {
    console.error(`Could not record the ${action} of post ${postId}:`, error);
  }
}
