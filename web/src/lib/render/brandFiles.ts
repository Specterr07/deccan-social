import { readFile } from "node:fs/promises";
import path from "node:path";

// Brand files are reached through web/public/brand (a symlink to /brand in dev, a real copy in Docker).
// The ignore comment stops Turbopack from trying to bundle the whole folder (it can't follow the symlink).
const BRAND_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "brand");

const mimeTypeByExtension: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const dataUriCache = new Map<string, string>();

// Reads a file under the brand folder and returns it as a data URI, so the rendered HTML needs no network or files.
// Throws a clear error if the file is missing (e.g. a typo in a logo path) instead of silently drawing a broken image.
export async function brandFileAsDataUri(publicPath: string): Promise<string> {
  const cached = dataUriCache.get(publicPath);
  if (cached) return cached;

  const relativePath = publicPath.replace(/^\/brand\//, "");
  const extension = path.extname(relativePath).toLowerCase();
  const mimeType = mimeTypeByExtension[extension];
  if (!mimeType) throw new Error(`Unsupported brand file type "${extension}" for ${publicPath}`);

  try {
    const bytes = await readFile(path.join(BRAND_DIR, relativePath));
    const dataUri = `data:${mimeType};base64,${bytes.toString("base64")}`;
    dataUriCache.set(publicPath, dataUri);
    return dataUri;
  } catch (error) {
    // Missing file or unreadable symlink: tell the developer which brand file and where we looked.
    throw new Error(`Could not read brand file ${publicPath} from ${BRAND_DIR}: ${(error as Error).message}`);
  }
}

// Reads a brand text file (tokens.css, templates.css).
export async function readBrandText(fileName: string): Promise<string> {
  try {
    return await readFile(path.join(BRAND_DIR, fileName), "utf8");
  } catch (error) {
    throw new Error(`Could not read brand file ${fileName} from ${BRAND_DIR}: ${(error as Error).message}`);
  }
}
