// Plain-text parts of the month pack: captions.md and schedule.csv. Pure functions, no network or database.
export type PackPost = {
  folder: string; date: string; time: string; kindLabel: string; headline: string; platforms: string[];
  captionInstagram: string; captionLinkedin: string; files: string[];
};

const PLATFORM_LABELS: Record<string, string> = { instagram: "Instagram", linkedin: "LinkedIn" };
const platformText = (platforms: string[]) => platforms.map((platform) => PLATFORM_LABELS[platform] ?? platform).join(" + ");

// One CSV cell: wrapped in quotes when it holds a comma, quote or line break (quotes doubled), as Excel and Numbers expect.
export function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// captions.md: every post with its date, time, platforms and both captions, ready to copy and paste.
export function buildCaptionsMarkdown(monthLabel: string, posts: PackPost[]): string {
  const sections = posts.map((post) => [
    `## ${post.date} · ${post.kindLabel}: ${post.headline}`,
    `Time: ${post.time} IST · Platforms: ${platformText(post.platforms)} · Files: ${post.folder}/`,
    "",
    "### Instagram",
    post.captionInstagram,
    "",
    "### LinkedIn",
    post.captionLinkedin,
  ].join("\n"));
  return [`# ${monthLabel} — captions`, "", ...sections.map((section) => `${section}\n`)].join("\n");
}

// schedule.csv: one row per post, in date order, so a scheduling tool or a person can work through it.
export function buildScheduleCsv(posts: PackPost[]): string {
  const header = ["date", "time", "post", "platforms", "files"].join(",");
  const rows = posts.map((post) => [post.date, post.time, post.headline, platformText(post.platforms), post.files.join("; ")].map(csvCell).join(","));
  return `${[header, ...rows].join("\r\n")}\r\n`;
}
