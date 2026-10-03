import { KIND_LABELS } from "@/components/calendar/kindStyles";
import { RequiredImageSlot } from "@/components/months/RequiredImageSlot";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { postStatusLabel } from "@/lib/months/postStatus";
import { ApproveButton } from "./ApproveButton";
import { ArtworkControls, type ArtworkBudget } from "./ArtworkControls";
import { CaptionTabs } from "./CaptionTabs";
import { EditPostSheet } from "./EditPostSheet";
import { RequestChangesDialog } from "./RequestChangesDialog";
import { SlideCarousel } from "./SlideCarousel";
import type { ReviewPost } from "./types";

// "2026-10-20" → "Tue 20 Oct"
function formatPostDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

const PLATFORM_LABELS: Record<string, string> = { instagram: "Instagram", linkedin: "LinkedIn" };

// One post for review: the drawn slides, both captions, why it was planned, any missing image, and the actions.
export function PostCard({ post, budget }: { post: ReviewPost; budget: ArtworkBudget }) {
  const slotSlides = post.slides.filter((slide) => slide.requiredImageKind);
  const statusVariant = post.status === "needs_image" ? "destructive" : post.status === "approved" ? "default" : "secondary";
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-lg font-medium">{formatPostDate(post.date)}{post.time ? ` · ${post.time.slice(0, 5)}` : ""}</h2>
          <Badge variant="secondary">{KIND_LABELS[post.kind] ?? post.kind}</Badge>
          <Badge variant={statusVariant}>{postStatusLabel(post.status)}</Badge>
        </div>
        <SlideCarousel slides={post.slides.map((slide) => ({ id: slide.id, renderUrl: slide.renderUrl, hero: slide.hero }))} aspect={post.aspect} />
        <p className="text-sm text-muted-foreground">{post.rationale} · {post.platforms.map((platform) => PLATFORM_LABELS[platform] ?? platform).join(" + ")}</p>
        <CaptionTabs instagram={post.captionInstagram} linkedin={post.captionLinkedin} />
        {slotSlides.map((slide) => (
          <RequiredImageSlot
            key={slide.id} slideId={slide.id} kind={slide.requiredImageKind!} description={slide.requiredImageDescription ?? "the image"}
            image={slide.requiredImage ? { url: slide.requiredImage.url, name: slide.requiredImage.name } : null}
            missingLibraryName={slide.requiredImage ? null : slide.requiredImageLibraryName}
          />
        ))}
        <ArtworkControls post={post} budget={budget} />
        <div className="flex flex-wrap items-start gap-2">
          <ApproveButton postId={post.id} status={post.status} />
          <EditPostSheet post={post} />
          <RequestChangesDialog postId={post.id} />
        </div>
      </CardContent>
    </Card>
  );
}
