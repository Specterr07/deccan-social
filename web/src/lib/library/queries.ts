import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { assets, slides } from "@/db/schema";
import { deleteObject } from "@/lib/r2";
import { renderPostQuietly } from "@/lib/render/renderPost";
import { refreshPostImageStatus } from "./postImageStatus";

export type LibraryFilter = { kind?: string; tag?: string; search?: string };

// Library images, newest first, optionally narrowed by kind, one tag, or text in the name/description.
export async function listAssets(filter: LibraryFilter = {}) {
  const conditions = [];
  if (filter.kind) conditions.push(eq(assets.kind, filter.kind));
  if (filter.tag) conditions.push(sql`${filter.tag.toLowerCase()} = any(${assets.tags})`);
  if (filter.search) {
    const pattern = `%${filter.search}%`;
    conditions.push(or(ilike(assets.name, pattern), ilike(assets.description, pattern)));
  }
  return db.select().from(assets).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(assets.createdAt));
}

// Finds an asset by its human name (case-insensitive), used when a calendar names an exact image.
export async function findAssetByName(name: string) {
  const [asset] = await db.select().from(assets).where(eq(sql`lower(${assets.name})`, name.trim().toLowerCase()));
  return asset ?? null;
}

// Deletes an image from the library and from storage. Slides that used it become empty again,
// and their posts go back to "needs_image" if a required image was lost. Returns how many slides were affected.
export async function deleteAsset(assetId: string): Promise<{ found: boolean; slidesAffected: number }> {
  const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
  if (!asset) return { found: false, slidesAffected: 0 };

  const users = await db.select({ id: slides.id, postId: slides.postId }).from(slides)
    .where(or(eq(slides.assetId, assetId), eq(slides.requiredImageAssetId, assetId)));
  await db.delete(assets).where(eq(assets.id, assetId)); // foreign keys set the slides' links to null

  if (asset.storageKey) {
    try {
      await deleteObject(asset.storageKey);
    } catch (error) {
      // The library row is already gone; an orphaned file in R2 costs almost nothing, so only log it.
      console.error(`Library row deleted but the file ${asset.storageKey} stayed in storage:`, error);
    }
  }
  for (const postId of new Set(users.map((slide) => slide.postId))) {
    await refreshPostImageStatus(postId);
    await renderPostQuietly(postId); // draw it again without the deleted picture
  }
  return { found: true, slidesAffected: users.length };
}
