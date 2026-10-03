import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assets, slides } from "@/db/schema";
import { createAssetFromFile } from "./createAsset";
import { refreshPostImageStatus } from "./postImageStatus";
import { slugifyName } from "./assetRules";

export type FillResult = { ok: true; assetId: string; url: string } | { ok: false; status: number; message: string };

// Loads a slide that has a required image slot, or explains why it cannot be filled.
async function loadSlotSlide(slideId: string) {
  const [slide] = await db.select().from(slides).where(eq(slides.id, slideId));
  if (!slide) return { error: { ok: false as const, status: 404, message: "That slide does not exist." } };
  if (!slide.requiredImageKind) return { error: { ok: false as const, status: 400, message: "This slide has no required image." } };
  return { slide };
}

// Links an asset to the slide's required slot and updates the post's status.
async function linkAsset(slideId: string, postId: string, assetId: string): Promise<void> {
  await db.update(slides).set({ requiredImageAssetId: assetId }).where(eq(slides.id, slideId));
  await refreshPostImageStatus(postId);
}

// Fills the slot with a newly uploaded file. The file is also saved to the library with tags, so it can be reused.
export async function fillWithUpload(slideId: string, file: File): Promise<FillResult> {
  const { slide, error } = await loadSlotSlide(slideId);
  if (error) return error;

  const isLogo = slide.requiredImageKind === "event_logo";
  const created = await createAssetFromFile({
    file,
    kind: isLogo ? "event_logo" : "photo",
    tags: isLogo ? ["event-logo"] : slide.photoTags,
    peopleOk: !isLogo, // someone deliberately uploaded this photo for this post, so people in it are fine
    name: slugifyName(slide.requiredImageDescription ?? file.name),
    description: slide.requiredImageDescription ?? undefined,
  });
  if (!created.ok) return { ok: false, status: 400, message: created.message };

  try {
    await linkAsset(slideId, slide.postId, created.assetId);
    return { ok: true, assetId: created.assetId, url: created.url };
  } catch (linkError) {
    // The image is in the library but could not be attached (database trouble); say so plainly.
    console.error(`Could not attach asset ${created.assetId} to slide ${slideId}:`, linkError);
    return { ok: false, status: 500, message: "The image was saved to the library but could not be attached. Please pick it from the library." };
  }
}

// Fills the slot with an image that is already in the library (the exact one the person chose).
export async function fillWithAsset(slideId: string, assetId: string): Promise<FillResult> {
  const { slide, error } = await loadSlotSlide(slideId);
  if (error) return error;
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
  if (!asset) return { ok: false, status: 404, message: "That library image no longer exists." };

  try {
    await linkAsset(slideId, slide.postId, asset.id);
    return { ok: true, assetId: asset.id, url: asset.url };
  } catch (linkError) {
    console.error(`Could not attach asset ${assetId} to slide ${slideId}:`, linkError);
    return { ok: false, status: 500, message: "We could not attach that image. Please try again." };
  }
}

// Empties the slot again (the library image itself is kept). The post goes back to "needs_image".
export async function clearRequiredImage(slideId: string): Promise<FillResult | { ok: true }> {
  const { slide, error } = await loadSlotSlide(slideId);
  if (error) return error;
  try {
    await db.update(slides).set({ requiredImageAssetId: null }).where(eq(slides.id, slideId));
    await refreshPostImageStatus(slide.postId);
    return { ok: true };
  } catch (clearError) {
    console.error(`Could not clear the image of slide ${slideId}:`, clearError);
    return { ok: false, status: 500, message: "We could not remove that image. Please try again." };
  }
}
