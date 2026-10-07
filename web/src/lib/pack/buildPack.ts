import { zipSync, strToU8 } from "fflate";
import { KIND_LABELS } from "@/components/calendar/kindStyles";
import { formatMonthLabel } from "@/lib/months/monthStatus";
import { getMonthWithPosts } from "@/lib/months/queries";
import { downloadObject, keyFromPublicUrl } from "@/lib/r2";
import { buildCaptionsMarkdown, buildScheduleCsv, type PackPost } from "./packText";

export type PackResult = { ok: true; fileName: string; bytes: Uint8Array; postCount: number } | { ok: false; status: number; message: string };

// Reads one drawn slide back from R2 (by its key, so it works whatever the public address is).
async function downloadSlide(url: string): Promise<Uint8Array> {
  const key = keyFromPublicUrl(url);
  if (!key) throw new Error(`The picture address ${url} is not in our storage.`);
  return new Uint8Array(await downloadObject(key));
}

// Builds the zip of a month's APPROVED posts: one folder per post (slide-01.jpg …), captions.md and schedule.csv.
// Posts are in date order (then time). Returns a friendly message instead of throwing.
export async function buildPack(monthId: string): Promise<PackResult> {
  try {
    const month = await getMonthWithPosts(monthId);
    if (!month) return { ok: false, status: 404, message: "That month does not exist." };
    const approved = month.posts.filter((post) => post.status === "approved").sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
    if (approved.length === 0) return { ok: false, status: 409, message: "No posts are approved yet. Approve at least one post to download a pack." };

    const files: Record<string, Uint8Array> = {};
    const packPosts: PackPost[] = [];
    for (const post of approved) {
      const folder = `${post.date}_${post.kind}-${post.id.slice(0, 8)}`;
      const slideFiles: string[] = [];
      for (const [index, slide] of post.slides.entries()) {
        if (!slide.renderUrl) return { ok: false, status: 500, message: `The post on ${post.date} has a slide that was never drawn, so the pack cannot be made. Open the post and press Save and redraw.` };
        const fileName = `${folder}/slide-${String(index + 1).padStart(2, "0")}.jpg`;
        files[fileName] = await downloadSlide(slide.renderUrl);
        slideFiles.push(fileName);
      }
      packPosts.push({
        folder, date: post.date, time: (post.time ?? "10:00").slice(0, 5), kindLabel: KIND_LABELS[post.kind] ?? post.kind,
        headline: post.slides[0]?.hero ?? post.kind, platforms: post.platforms, captionInstagram: post.captionInstagram ?? "",
        captionLinkedin: post.captionLinkedin ?? "", files: slideFiles,
      });
    }
    files["captions.md"] = strToU8(buildCaptionsMarkdown(formatMonthLabel(month.month), packPosts));
    files["schedule.csv"] = strToU8(buildScheduleCsv(packPosts));

    // level 0 = store: the JPEGs are already compressed, so deflating them again only wastes time.
    return { ok: true, fileName: `deccan-${month.month}-posts.zip`, bytes: zipSync(files, { level: 0 }), postCount: approved.length };
  } catch (error) {
    // Storage unreachable or a picture file missing from it.
    console.error(`Building the pack for ${monthId} failed:`, error);
    return { ok: false, status: 500, message: `We could not build the pack: ${(error as Error).message}` };
  }
}
