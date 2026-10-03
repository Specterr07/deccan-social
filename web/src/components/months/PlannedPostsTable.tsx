import { Badge } from "@/components/ui/badge";
import { postStatusLabel } from "@/lib/months/postStatus";
import type { getMonthWithPosts } from "@/lib/months/queries";
import { KIND_LABELS } from "@/components/calendar/kindStyles";
import { RequiredImageSlot } from "./RequiredImageSlot";

type PostWithSlides = NonNullable<Awaited<ReturnType<typeof getMonthWithPosts>>>["posts"][number];

// "2026-10-20" → "Tue 20 Oct"
function formatPostDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

// The required images of a post's slides (event logo, specific photo), each as a fill-in box.
function PostImageSlots({ post }: { post: PostWithSlides }) {
  const slots = post.slides.filter((slide) => slide.requiredImageKind);
  if (slots.length === 0) return <span className="text-muted-foreground">Picked automatically</span>;
  return (
    <div className="space-y-2">
      {slots.map((slide) => (
        <RequiredImageSlot
          key={slide.id}
          slideId={slide.id}
          kind={slide.requiredImageKind!}
          description={slide.requiredImageDescription ?? "the image"}
          image={slide.requiredImage ? { url: slide.requiredImage.url, name: slide.requiredImage.name } : null}
          missingLibraryName={slide.requiredImage ? null : slide.requiredImageLibraryName}
        />
      ))}
    </div>
  );
}

// Read-only list of the planned posts plus their required-image slots. The full review page (images, approve, edit) arrives in T-06.
export function PlannedPostsTable({ posts }: { posts: PostWithSlides[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Headline</th>
            <th className="p-3 font-medium">Status</th>
            <th className="min-w-72 p-3 font-medium">Images</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b align-top last:border-0">
              <td className="whitespace-nowrap p-3">{formatPostDate(post.date)}</td>
              <td className="p-3"><Badge variant="secondary">{KIND_LABELS[post.kind] ?? post.kind}</Badge></td>
              <td className="p-3 font-medium">{post.slides[0]?.hero}<p className="font-normal text-muted-foreground">{post.rationale}</p></td>
              <td className="p-3"><Badge variant={post.status === "needs_image" ? "destructive" : "secondary"}>{postStatusLabel(post.status)}</Badge></td>
              <td className="p-3"><PostImageSlots post={post} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
