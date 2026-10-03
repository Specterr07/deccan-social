import { env } from "@/env";
import { sendEmail } from "@/lib/email";
import { KIND_LABELS } from "@/components/calendar/kindStyles";
import { formatMonthLabel } from "@/lib/months/monthStatus";
import { getMonthWithPosts } from "@/lib/months/queries";
import { buildReviewEmail } from "./buildReviewEmail";
import { readEmailColors } from "./emailColors";

// Emails the reviewer that a month's posts are ready. Returns a readable problem instead of throwing, so a failed
// email never makes a finished plan look failed; the caller shows the problem as a notice.
export async function sendReviewEmail(monthId: string): Promise<{ ok: true } | { ok: false; problem: string }> {
  try {
    const month = await getMonthWithPosts(monthId);
    if (!month) return { ok: false, problem: "The month no longer exists." };
    if (month.posts.length === 0) return { ok: false, problem: "There are no posts to email." };

    const built = buildReviewEmail({
      monthLabel: formatMonthLabel(month.month),
      reviewUrl: `${env.APP_URL.replace(/\/$/, "")}/months/${month.id}`,
      posts: month.posts.map((post) => ({
        date: post.date, kindLabel: KIND_LABELS[post.kind] ?? post.kind, headline: post.slides[0]?.hero ?? KIND_LABELS[post.kind] ?? "Post",
        thumbnailUrl: post.slides[0]?.renderUrl ?? null, needsImage: post.status === "needs_image",
      })),
    }, await readEmailColors());

    await sendEmail({ to: env.REVIEWER_EMAIL, ...built });
    return { ok: true };
  } catch (error) {
    // The email service refused or was unreachable, or a brand file could not be read.
    console.error(`Sending the review email for month ${monthId} failed:`, error);
    return { ok: false, problem: (error as Error).message };
  }
}
