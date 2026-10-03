import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import { generations, months, posts, slides } from "@/db/schema";
import { renderPost } from "@/lib/render/renderPost";
import { generateArtwork } from "./generateArtwork";

export type PictureResult = { ok: true } | { ok: false; status: number; message: string };

async function loadSlide(slideId: string) {
  const [row] = await db.select({ slide: slides, post: posts }).from(slides).innerJoin(posts, eq(slides.postId, posts.id)).where(eq(slides.id, slideId));
  return row ?? null;
}

// Draws the post again after its picture changed (only this post).
async function redraw(postId: string): Promise<PictureResult> {
  const report = await renderPost(postId);
  return report.problems.length > 0 ? { ok: false, status: 500, message: `The picture was changed, but the post could not be redrawn:\n${report.problems.join("\n")}` } : { ok: true };
}

// Swap: choose one of THIS slide's own artwork variants as its picture. Nothing is generated, so it costs nothing.
export async function swapPicture(slideId: string, assetId: string): Promise<PictureResult> {
  try {
    const row = await loadSlide(slideId);
    if (!row) return { ok: false, status: 404, message: "That slide does not exist." };
    const [variant] = await db.select({ id: generations.id }).from(generations).where(and(eq(generations.slideId, slideId), eq(generations.assetId, assetId)));
    if (!variant) return { ok: false, status: 400, message: "That picture is not one of this slide's artwork options." };
    await db.update(slides).set({ assetId }).where(eq(slides.id, slideId));
    return await redraw(row.post.id);
  } catch (error) {
    // Database trouble, or a malformed id in the address.
    console.error(`Swapping the picture of slide ${slideId} failed:`, error);
    return { ok: false, status: 500, message: "We could not change the picture. Please try again." };
  }
}

// Try another picture: makes ONE more artwork variant (budget-checked, logged with its cost), selects it and redraws the post.
// Earlier variants stay available for swapping back.
export async function regenerateArtwork(slideId: string): Promise<PictureResult> {
  try {
    const row = await loadSlide(slideId);
    if (!row) return { ok: false, status: 404, message: "That slide does not exist." };
    const { slide, post } = row;
    if (slide.requiredImageKind === "specific") return { ok: false, status: 400, message: "This post uses a photo from your team, not artwork." };
    if (!slide.artworkPrompt) return { ok: false, status: 400, message: "This slide has no artwork scene to generate from." };
    const [month] = await db.select().from(months).where(eq(months.id, post.monthId));
    if (month?.status === "planning") return { ok: false, status: 409, message: "The month is being planned. Wait until it finishes." };

    const earlier = await db.select({ variant: generations.variant }).from(generations).where(and(eq(generations.slideId, slideId), isNotNull(generations.requestId)));
    const nextVariant = Math.max(0, ...earlier.map((generation) => generation.variant)) + 1;
    const artwork = await generateArtwork({ slideId, scene: slide.artworkPrompt, photoTags: slide.photoTags }, 1, nextVariant);
    if (artwork.assetIds.length === 0) return { ok: false, status: 422, message: artwork.message ?? "No picture could be made. Please try again." };

    await db.update(slides).set({ assetId: artwork.assetIds[0] }).where(eq(slides.id, slideId));
    return await redraw(post.id);
  } catch (error) {
    console.error(`Regenerating the artwork of slide ${slideId} failed:`, error);
    return { ok: false, status: 500, message: "We could not make another picture. Please try again." };
  }
}
