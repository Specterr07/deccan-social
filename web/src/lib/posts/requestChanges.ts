import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { months, posts, slides } from "@/db/schema";
import { askForRewrite, buildRewriteMessage, type RewriteConversation, type RewriteSource } from "@/lib/ai/rewritePost";
import { canSpend } from "@/lib/budget";
import { renderPost } from "@/lib/render/renderPost";
import { checkPost } from "@/schemas/planRules";
import type { AnswerPost } from "@/schemas/plan";
import type { PostActionResult } from "./approvePost";
import { postToPlanPost } from "./planPostFromDb";
import { logReview } from "./reviewLog";
import { saveWords } from "./saveWords";

const MAX_NOTE_CHARS = 500;
const MAX_CORRECTION_ROUNDS = 2; // the light model sometimes lands 1-3 characters over a limit; each round costs about half a cent
const ESTIMATED_REWRITE_USD = 0.03; // one post with captions on the light model costs about a cent; keep a margin for the budget check

type PostRow = typeof posts.$inferSelect;
type SlideRow = typeof slides.$inferSelect;
type DetailsJson = { dates?: { day: string; month: string }[]; venue?: string; stand?: string } | null;

function toSource(post: PostRow, postSlides: SlideRow[]): RewriteSource {
  const details = (postSlides[0]?.details ?? null) as DetailsJson;
  return {
    entryId: post.entryId ?? post.id, kind: post.kind, fruit: post.fruit, captionInstagram: post.captionInstagram ?? "",
    captionLinkedin: post.captionLinkedin ?? "", rationale: post.rationale ?? "",
    slides: postSlides.map((slide) => ({
      variant: slide.templateVariant, eyebrow: slide.eyebrow ?? undefined, hero: slide.hero ?? "", sub: slide.sub ?? undefined,
      body: slide.body ?? undefined, checklist: (slide.checklist as string[] | null) ?? undefined,
    })),
    facts: details ? { dates: details.dates, venue: details.venue, stand: details.stand } : undefined,
  };
}

// Puts Claude's new words on the saved slides (same order). Pictures, facts and the post type are never touched.
function applyAnswer(postSlides: SlideRow[], answer: AnswerPost): SlideRow[] {
  return postSlides.map((slide, index) => {
    const words = answer.slides[index];
    return { ...slide, eyebrow: words.eyebrow ?? null, hero: words.hero, sub: words.sub ?? null, body: words.body ?? null, checklist: words.checklist ?? slide.checklist };
  });
}

// Problems with the rewritten post as readable lines (empty = fine): the slide layout must be unchanged and every planning limit must hold.
function findProblems(post: PostRow, postSlides: SlideRow[], answer: AnswerPost): string[] {
  const sameLayout = answer.slides.length === postSlides.length && answer.slides.every((slide, index) => slide.variant === postSlides[index].templateVariant);
  if (!sameLayout) return [`The post must keep its ${postSlides.length} slide(s) with the same variants (${postSlides.map((slide) => slide.templateVariant).join(", ")}).`];
  const planPost = postToPlanPost({ ...post, captionInstagram: answer.caption_instagram, captionLinkedin: answer.caption_linkedin, rationale: answer.rationale }, applyAnswer(postSlides, answer));
  return checkPost(planPost, 0, post.date.slice(0, 7)).map((problem) => `${problem.path[2] === "slides" ? `Slide ${Number(problem.path[3]) + 1}: ` : ""}${problem.message}`);
}

// "Ask for changes": Claude (light model) rewrites ONLY this post following the note, the planning limits are checked
// (one correction round if broken), then only this post is drawn again. The note is saved in the post's history.
export async function requestChanges(postId: string, rawNote: unknown): Promise<PostActionResult> {
  const note = typeof rawNote === "string" ? rawNote.trim() : "";
  if (!note) return { ok: false, status: 400, message: "Please write what should change." };
  if (note.length > MAX_NOTE_CHARS) return { ok: false, status: 400, message: `Please keep the request under ${MAX_NOTE_CHARS} characters.` };

  try {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return { ok: false, status: 404, message: "That post does not exist." };
    const [month] = await db.select().from(months).where(eq(months.id, post.monthId));
    if (month?.status === "planning") return { ok: false, status: 409, message: "The month is being planned. Wait until it finishes." };
    const postSlides = await db.select().from(slides).where(eq(slides.postId, postId)).orderBy(slides.idx);
    if (!(await canSpend(ESTIMATED_REWRITE_USD))) return { ok: false, status: 402, message: "This month's AI budget is used up, so the post cannot be rewritten now." };

    const context = { monthId: post.monthId, postId };
    const conversation: RewriteConversation = [buildRewriteMessage(toSource(post, postSlides), note)];
    let answer = await askForRewrite(conversation, context);
    let problems = findProblems(post, postSlides, answer.post);
    for (let round = 0; round < MAX_CORRECTION_ROUNDS && problems.length > 0; round += 1) {
      // Tell Claude exactly what broke and ask again (same idea as planning's fix call).
      conversation.push({ role: "assistant", content: answer.assistantContent }, { role: "user", content: `This breaks the rules:\n${problems.map((line) => `- ${line}`).join("\n")}\n\nReturn the corrected post. Fix only what breaks a rule, and shorten each over-long text well below its limit (about 10% under) so it is safe.` });
      answer = await askForRewrite(conversation, context);
      problems = findProblems(post, postSlides, answer.post);
    }
    if (problems.length > 0) return { ok: false, status: 422, message: `The rewrite still broke the content limits, so nothing was changed:\n${problems.join("\n")}` };

    await saveWords(post, applyAnswer(postSlides, answer.post), { instagram: answer.post.caption_instagram, linkedin: answer.post.caption_linkedin }, answer.post.rationale);
    await logReview(postId, "request_changes", note);
    const report = await renderPost(postId);
    if (report.problems.length > 0) return { ok: false, status: 500, message: `Rewritten, but the picture could not be redrawn:\n${report.problems.join("\n")}` };
    return { ok: true };
  } catch (error) {
    // Claude or the database was unreachable, or the answer was unusable.
    console.error(`Requesting changes for post ${postId} failed:`, error);
    return { ok: false, status: 500, message: error instanceof Error ? error.message : "We could not rewrite this post. Please try again." };
  }
}
