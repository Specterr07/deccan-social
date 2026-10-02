import { Badge } from "@/components/ui/badge";
import type { posts, slides } from "@/db/schema";

type PostWithSlides = typeof posts.$inferSelect & { slides: (typeof slides.$inferSelect)[] };

const KIND_LABELS: Record<string, string> = {
  festival: "Festival",
  day_of: "Day-of",
  exhibition: "Exhibition",
  informative: "Carousel",
  bts: "Behind the scenes",
};

// "2026-10-20" → "Tue 20 Oct"
function formatPostDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

// Simple read-only list of the planned posts. The full review page (images, approve, edit) arrives in T-06.
export function PlannedPostsTable({ posts }: { posts: PostWithSlides[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Headline</th>
            <th className="p-3 font-medium">Slides</th>
            <th className="p-3 font-medium">Why this post</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b last:border-0 align-top">
              <td className="p-3 whitespace-nowrap">{formatPostDate(post.date)}</td>
              <td className="p-3"><Badge variant="secondary">{KIND_LABELS[post.kind] ?? post.kind}</Badge></td>
              <td className="p-3 font-medium">{post.slides[0]?.hero}</td>
              <td className="p-3">{post.slides.length}{post.aspect === "1:1" ? " · square" : ""}</td>
              <td className="p-3 text-muted-foreground">{post.rationale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
