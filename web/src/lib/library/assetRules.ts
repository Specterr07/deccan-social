// Small shared rules for library images: kinds, allowed files, name and tag cleaning.

export const UPLOAD_KINDS = ["photo", "cutout", "event_logo", "illustration"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_TAGS = 12;

// Photos tagged like this show people, so they are only auto-picked when "people OK to post" is ticked.
export const PEOPLE_TAGS = ["people", "person", "team", "staff", "worker", "workers", "portrait", "face"];

// "Nashik Packhouse Team.JPG" → "nashik-packhouse-team" (lower-case words and hyphens).
export function slugifyName(text: string): string {
  const withoutExtension = text.replace(/\.[a-z0-9]{2,5}$/i, "");
  const slug = withoutExtension.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return slug || "image";
}

// "Pomegranate, orchard ,Orchard" → ["pomegranate", "orchard"] (lower-case, trimmed, no repeats).
export function parseTags(text: string): string[] {
  const tags = text.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  return [...new Set(tags)].slice(0, MAX_TAGS);
}

// Does a real image start with the right bytes? Catches a renamed PDF or text file.
export function looksLikeImage(bytes: Buffer, contentType: string): boolean {
  if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (contentType === "image/png") return bytes.subarray(1, 4).toString() === "PNG";
  if (contentType === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  return false;
}
