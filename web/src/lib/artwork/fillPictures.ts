import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, slides } from "@/db/schema";
import { pickAsset } from "@/lib/library/pickAsset";
import { generateArtwork } from "./generateArtwork";

// The picture step of a month (ADR-014): every slide gets its automatic picture, library first, then AI artwork.
// Required images (event logo, specific photo) are never touched here. Returns notices for the month page (may be empty).
export async function fillPictures(monthId: string, onlySlideId?: string): Promise<string[]> {
  const notices = new Set<string>();
  const monthSlides = await db.select({ slide: slides }).from(slides).innerJoin(posts, eq(slides.postId, posts.id)).where(eq(posts.monthId, monthId));

  for (const { slide } of monthSlides) {
    if (onlySlideId && slide.id !== onlySlideId) continue;
    if (slide.requiredImageKind === "specific") continue; // a real photo supplied by the team replaces the automatic picture
    try {
      const libraryPhoto = await pickAsset(slide.photoTags);
      if (libraryPhoto) {
        await db.update(slides).set({ assetId: libraryPhoto.id }).where(eq(slides.id, slide.id));
        continue;
      }
      if (!slide.artworkPrompt) continue; // nothing to generate from: the template shows its plain background
      const artwork = await generateArtwork({ slideId: slide.id, scene: slide.artworkPrompt, photoTags: slide.photoTags });
      if (artwork.assetIds.length > 0) await db.update(slides).set({ assetId: artwork.assetIds[0] }).where(eq(slides.id, slide.id));
      if (artwork.message) notices.add(artwork.message);
    } catch (error) {
      // One slide failing (database trouble) must not stop the others.
      console.error(`Could not pick a picture for slide ${slide.id}:`, error);
      notices.add("Some pictures could not be chosen; those posts keep a plain background.");
    }
  }
  return [...notices];
}
