import type { posts, slides } from "@/db/schema";
import type { PlanPost, PlanSlide } from "@/schemas/plan";
import type { PostKind } from "@/schemas/limits";

type PostRow = typeof posts.$inferSelect;
type SlideRow = typeof slides.$inferSelect;
type DetailsJson = { dates?: { day: string; month: string }[]; venue?: string; stand?: string } | null;

// A saved slide in the shape the planning rules understand, so an edited post can be checked with the SAME limits as a planned one.
function slideToPlanSlide(slide: SlideRow): PlanSlide {
  const details = (slide.details ?? null) as DetailsJson;
  return {
    variant: slide.templateVariant as PlanSlide["variant"],
    eyebrow: slide.eyebrow ?? undefined,
    hero: slide.hero ?? "",
    sub: slide.sub ?? undefined,
    body: slide.body ?? undefined,
    dates: details?.dates, venue: details?.venue, stand: details?.stand,
    checklist: (slide.checklist as string[] | null) ?? undefined,
    photo_tags: slide.photoTags,
    artwork_prompt: slide.artworkPrompt ?? undefined,
    required_image: slide.requiredImageKind
      ? { kind: slide.requiredImageKind as "event_logo" | "specific", description: slide.requiredImageDescription ?? "image" }
      : undefined,
  };
}

export function postToPlanPost(post: PostRow, postSlides: SlideRow[]): PlanPost {
  return {
    entry_id: post.entryId ?? "",
    date: post.date,
    time: post.time?.slice(0, 5),
    kind: post.kind as PostKind,
    fruit: post.fruit as PlanPost["fruit"],
    aspect: post.aspect as PlanPost["aspect"],
    platforms: post.platforms as PlanPost["platforms"],
    caption_instagram: post.captionInstagram ?? "",
    caption_linkedin: post.captionLinkedin ?? "",
    rationale: post.rationale ?? "",
    slides: postSlides.map(slideToPlanSlide),
  };
}
