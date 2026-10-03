import type { EmailColors } from "./emailColors";

export type EmailPost = { date: string; kindLabel: string; headline: string; thumbnailUrl: string | null; needsImage: boolean };
export type ReviewEmailInput = { monthLabel: string; reviewUrl: string; posts: EmailPost[] };
export type BuiltEmail = { subject: string; html: string; text: string };

// Stops text from the posts (headlines may contain & or <) from being read as HTML.
export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// "2026-10-20" → "Tue 20 Oct"
function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function needsImageLine(count: number): string {
  return `${count} ${count === 1 ? "post needs an image" : "posts need images"} from you`;
}

// One post: thumbnail (or a plain box if it was not drawn), date, type and headline. Table-based with inline styles
// because email clients drop <style> blocks and modern layout.
function postCell(post: EmailPost, colors: EmailColors): string {
  const picture = post.thumbnailUrl
    ? `<img src="${escapeHtml(post.thumbnailUrl)}" width="250" alt="Preview of ${escapeHtml(post.headline)}" style="display:block;width:100%;max-width:250px;height:auto;border-radius:8px;border:1px solid ${colors.paperDark}">`
    : `<div style="width:250px;max-width:100%;height:100px;line-height:100px;text-align:center;border-radius:8px;background:${colors.paperDark};color:${colors.inkSoft};font-size:13px">Not drawn yet</div>`;
  const flag = post.needsImage ? `<div style="color:${colors.alert};font-weight:bold;font-size:13px;padding-top:4px">Needs an image</div>` : "";
  return `<td valign="top" width="50%" style="padding:0 8px 20px 8px">${picture}
    <div style="padding-top:8px;font-size:13px;color:${colors.inkSoft}">${escapeHtml(formatDate(post.date))} · ${escapeHtml(post.kindLabel)}</div>
    <div style="font-size:15px;font-weight:bold;color:${colors.ink}">${escapeHtml(post.headline)}</div>${flag}</td>`;
}

// Builds the "your posts are ready" email: subject, HTML and a plain-text twin. Pure: no network, no database.
export function buildReviewEmail(input: ReviewEmailInput, colors: EmailColors): BuiltEmail {
  const { monthLabel, reviewUrl, posts } = input;
  const needImageCount = posts.filter((post) => post.needsImage).length;
  const subject = `Your ${monthLabel} posts are ready (${posts.length} ${posts.length === 1 ? "post" : "posts"})`;

  const rows: string[] = [];
  for (let start = 0; start < posts.length; start += 2) {
    const pair = posts.slice(start, start + 2);
    rows.push(`<tr>${pair.map((post) => postCell(post, colors)).join("")}${pair.length === 1 ? '<td width="50%"></td>' : ""}</tr>`);
  }

  const imageBanner = needImageCount > 0
    ? `<div style="margin:0 0 20px 0;padding:12px 16px;border-radius:8px;border:2px solid ${colors.alert};color:${colors.alert};font-size:15px"><strong>${needsImageLine(needImageCount)}.</strong> Add ${needImageCount === 1 ? "it" : "them"} on the review page and ${needImageCount === 1 ? "the post" : "the posts"} will be drawn again.</div>`
    : "";

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:${colors.paper}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${colors.white};border-radius:12px;font-family:Helvetica,Arial,sans-serif;color:${colors.ink}"><tr><td style="padding:28px 24px 8px 24px">
<div style="font-size:18px;font-weight:bold;color:${colors.green}">Deccan Produce</div>
<h1 style="margin:12px 0 8px 0;font-size:24px;color:${colors.ink}">Your ${escapeHtml(monthLabel)} posts are ready</h1>
<p style="margin:0 0 20px 0;font-size:15px;line-height:22px;color:${colors.inkSoft}">${posts.length} ${posts.length === 1 ? "post is" : "posts are"} waiting for your review. Nothing is published until you approve it.</p>
${imageBanner}
<a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:${colors.green};color:${colors.white};font-size:16px;font-weight:bold;text-decoration:none">Review the posts</a>
</td></tr><tr><td style="padding:24px 16px 8px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join("")}</table></td></tr>
<tr><td style="padding:0 24px 28px 24px;font-size:13px;color:${colors.inkSoft}">Button not working? Open this address: <a href="${escapeHtml(reviewUrl)}" style="color:${colors.green}">${escapeHtml(reviewUrl)}</a></td></tr></table>
</td></tr></table></body></html>`;

  const text = [
    `Your ${monthLabel} posts are ready.`,
    `${posts.length} ${posts.length === 1 ? "post is" : "posts are"} waiting for your review. Nothing is published until you approve it.`,
    needImageCount > 0 ? `\n${needsImageLine(needImageCount)}. Add ${needImageCount === 1 ? "it" : "them"} on the review page.` : "",
    `\nReview the posts: ${reviewUrl}\n`,
    ...posts.map((post) => `- ${formatDate(post.date)} · ${post.kindLabel}: ${post.headline}${post.needsImage ? " (needs an image)" : ""}`),
  ].filter((line) => line !== "").join("\n");

  return { subject, html, text };
}
