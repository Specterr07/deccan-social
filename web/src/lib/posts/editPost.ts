import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";
import { renderPost } from "@/lib/render/renderPost";
import { checkPost } from "@/schemas/planRules";
import { postEditSchema } from "@/schemas/postEdit";
import type { PostActionResult } from "./approvePost";
import { postToPlanPost } from "./planPostFromDb";
import { saveWords } from "./saveWords";
import { logReview } from "./reviewLog";

const clean = (text: string | undefined): string | null => (text?.trim() ? text.trim() : null);

// Saves edited words (headline text and captions), checks them against the same limits as planning, and draws only this post again.
// An approved post goes back to "Ready for review": an edit needs a fresh look.
export async function editPost(postId: string, body: unknown): Promise<PostActionResult> {
  const edit = postEditSchema.safeParse(body);
  if (!edit.success) return { ok: false, status: 400, message: "That edit was not understood. Please reload the page and try again." };

  try {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return { ok: false, status: 404, message: "That post does not exist." };
    const postSlides = await db.select().from(slides).where(eq(slides.postId, postId)).orderBy(slides.idx);
    if (edit.data.slides.some((sent) => !postSlides.some((saved) => saved.id === sent.id))) {
      return { ok: false, status: 400, message: "A slide in the edit does not belong to this post." };
    }

    // Build the post as it would look after the edit, then run the planning rules on it.
    const edited = postSlides.map((saved) => {
      const sent = edit.data.slides.find((candidate) => candidate.id === saved.id);
      return sent ? { ...saved, eyebrow: clean(sent.eyebrow), hero: sent.hero.trim(), sub: clean(sent.sub), body: clean(sent.body), checklist: sent.checklist ?? saved.checklist } : saved;
    });
    const planPost = postToPlanPost({ ...post, captionInstagram: edit.data.captionInstagram, captionLinkedin: edit.data.captionLinkedin }, edited);
    const problems = checkPost(planPost, 0, post.date.slice(0, 7));
    if (problems.length > 0) {
      const lines = problems.map((problem) => `${problem.path[2] === "slides" ? `Slide ${Number(problem.path[3]) + 1}: ` : ""}${problem.message}`);
      return { ok: false, status: 422, message: lines.join("\n") };
    }

    await saveWords(post, edited, { instagram: edit.data.captionInstagram, linkedin: edit.data.captionLinkedin });
    await logReview(postId, "edit");

    const report = await renderPost(postId);
    if (report.problems.length > 0) return { ok: false, status: 500, message: `Saved, but the picture could not be redrawn:\n${report.problems.join("\n")}` };
    return { ok: true };
  } catch (error) {
    // Database trouble, or a malformed id in the address.
    console.error(`Editing post ${postId} failed:`, error);
    return { ok: false, status: 500, message: "We could not save the edit. Please try again." };
  }
}
