import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assets } from "@/db/schema";
import { uploadObject } from "@/lib/r2";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, looksLikeImage, slugifyName, type UploadKind } from "./assetRules";

export type NewAssetInput = { file: File; kind: UploadKind; tags: string[]; peopleOk: boolean; name?: string; description?: string };
export type CreateAssetResult = { ok: true; assetId: string; name: string; url: string } | { ok: false; message: string };

// Finds a name nobody else uses: "team", then "team-2", "team-3"…
async function uniqueName(baseName: string): Promise<string> {
  for (let attempt = 1; attempt < 100; attempt += 1) {
    const candidate = attempt === 1 ? baseName : `${baseName}-${attempt}`;
    const [taken] = await db.select({ id: assets.id }).from(assets).where(eq(assets.name, candidate));
    if (!taken) return candidate;
  }
  throw new Error(`Could not find a free name for "${baseName}".`);
}

// Checks one uploaded image, stores it in R2 and adds it to the library. Returns a friendly message instead of throwing.
export async function createAssetFromFile(input: NewAssetInput): Promise<CreateAssetResult> {
  const { file } = input;
  const extension = IMAGE_TYPES[file.type];
  if (!extension) return { ok: false, message: `${file.name}: please upload a JPG, PNG or WebP image.` };
  if (file.size === 0) return { ok: false, message: `${file.name}: the file is empty.` };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: `${file.name}: over 10 MB. Please upload a smaller image.` };

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!looksLikeImage(bytes, file.type)) return { ok: false, message: `${file.name}: this does not look like a real ${extension.toUpperCase()} image.` };

    const name = await uniqueName(slugifyName(input.name || file.name));
    const storageKey = `library/${randomUUID()}.${extension}`;
    const url = await uploadObject(storageKey, bytes, file.type);
    const [created] = await db.insert(assets).values({
      name, url, storageKey, kind: input.kind, tags: input.tags, description: input.description,
      peopleOk: input.peopleOk, source: "upload",
    }).returning({ id: assets.id });
    return { ok: true, assetId: created.id, name, url };
  } catch (error) {
    // Storage or database trouble; details go to the log, the person gets a plain message.
    console.error(`Saving ${file.name} to the library failed:`, error);
    return { ok: false, message: `${file.name}: could not be saved. Please try again in a minute.` };
  }
}
