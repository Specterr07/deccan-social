import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assets } from "@/db/schema";
import { createAssetFromFile } from "@/lib/library/createAsset";
import { slugifyName } from "@/lib/library/assetRules";

// Adds brand/sample-photos/* to the library with sensible tags (`pnpm seed:library`).
// Safe to run again: a photo whose name already exists is skipped.
const PHOTO_DIR = path.join(process.cwd(), "..", "brand", "sample-photos");

const TAGS_BY_FILE: Record<string, { tags: string[]; peopleOk: boolean }> = {
  "arils.jpg": { tags: ["pomegranate", "arils", "fruit", "close-up", "red"], peopleOk: false },
  "orchard.jpg": { tags: ["pomegranate", "orchard", "tree", "farm", "harvest"], peopleOk: false },
  "packhouse.jpg": { tags: ["packhouse", "grapes", "grading", "team", "people"], peopleOk: true }, // staff from an already published post
  "pomegranate-cut.jpg": { tags: ["pomegranate", "cut", "fruit", "red"], peopleOk: false },
  "tropical.jpg": { tags: ["mango", "pineapple", "dragon-fruit", "tropical", "fruit"], peopleOk: false },
};

async function main(): Promise<void> {
  const files = (await readdir(PHOTO_DIR)).filter((file) => file.toLowerCase().endsWith(".jpg")).sort();
  for (const fileName of files) {
    const name = `sample-${slugifyName(fileName)}`;
    const [existing] = await db.select({ id: assets.id }).from(assets).where(eq(assets.name, name));
    if (existing) { console.info(`skip   ${name} (already in the library)`); continue; }

    const bytes = await readFile(path.join(PHOTO_DIR, fileName));
    const settings = TAGS_BY_FILE[fileName] ?? { tags: [], peopleOk: false };
    const result = await createAssetFromFile({
      file: new File([bytes], fileName, { type: "image/jpeg" }), kind: "photo", name,
      tags: settings.tags, peopleOk: settings.peopleOk, description: `Sample photo from the brand kit (${fileName})`,
    });
    console.info(result.ok ? `added  ${result.name}` : `FAILED ${fileName}: ${result.message}`);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  // Typical causes: storage or database not reachable, or a missing .env.local.
  console.error("Seeding the library failed:", error);
  process.exit(1);
});
