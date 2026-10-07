import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";
import { deleteObject, keyFromPublicUrl, uploadObject } from "@/lib/r2";
import { buildRenderInput } from "./fromDb";
import { renderSlide } from "./renderSlide";

export type RenderReport = { problems: string[] }; // readable lines for the month page; empty = everything rendered

async function loadPost(postId: string) {
  return db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: { slides: { orderBy: (table, { asc }) => [asc(table.idx)], with: { asset: true, requiredImage: true } } },
  });
}

// Renders every slide of one post to a JPEG in R2 and saves the URLs. A slide that fails is reported and skipped,
// so the other slides (and other posts) carry on. A post waiting for an image stays "needs_image" but is still rendered
// with its placeholder, so the reviewer can see it.
export async function renderPost(postId: string): Promise<RenderReport> {
  const problems: string[] = [];
  const post = await loadPost(postId);
  if (!post) return { problems: ["A post to render no longer exists."] };

  let renderedCount = 0;
  for (const slide of post.slides) {
    try {
      const jpeg = await renderSlide(buildRenderInput(post, slide, post.slides.length));
      const key = `renders/${slide.id}-${Date.now()}.jpg`; // a new key each time so browsers never show an old picture
      const url = await uploadObject(key, jpeg, "image/jpeg");
      await db.update(slides).set({ renderUrl: url }).where(eq(slides.id, slide.id));
      renderedCount += 1;
      const oldKey = slide.renderUrl ? keyFromPublicUrl(slide.renderUrl) : null;
      if (oldKey) await deleteObject(oldKey).catch((error) => console.warn(`Could not delete the old render ${oldKey}:`, error)); // only wasted space if it fails
    } catch (error) {
      // Typical causes: a picture that will not load, Chromium trouble, or storage unreachable.
      console.error(`Rendering slide ${slide.id} of post ${postId} failed:`, error);
      // A zod error means the saved slide does not fit its template; its raw JSON would only confuse the reviewer.
      const reason = error instanceof ZodError ? "the saved text or picture does not fit its template" : (error as Error).message;
      problems.push(`${post.date} · ${slide.hero ?? post.kind}: ${reason}`);
    }
  }

  if (renderedCount === post.slides.length && post.status === "draft") {
    await db.update(posts).set({ status: "rendered" }).where(eq(posts.id, postId));
  }
  return { problems };
}

// Like renderPost but never throws, for use right after an image was filled in (the upload itself already succeeded).
export async function renderPostQuietly(postId: string): Promise<void> {
  try {
    await renderPost(postId);
  } catch (error) {
    console.error(`Re-rendering post ${postId} failed:`, error);
  }
}

// Renders all posts of a month, one after another. `onProgress` lets the plan job show "Rendering 3 of 6".
export async function renderMonth(monthId: string, onProgress?: (done: number, total: number) => Promise<void>): Promise<string[]> {
  const monthPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.monthId, monthId));
  const problems: string[] = [];
  for (const [index, post] of monthPosts.entries()) {
    await onProgress?.(index, monthPosts.length);
    try {
      problems.push(...(await renderPost(post.id)).problems);
    } catch (error) {
      console.error(`Rendering post ${post.id} failed:`, error);
      problems.push(`A post could not be rendered: ${(error as Error).message}`);
    }
  }
  if (problems.length > 0) problems.unshift("Some posts could not be drawn; the rest are ready.");
  return problems;
}
