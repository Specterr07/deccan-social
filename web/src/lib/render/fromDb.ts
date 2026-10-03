import type { assets, posts, slides } from "@/db/schema";
import type { RenderInput, TemplateName } from "./types";

type PostRow = typeof posts.$inferSelect;
type AssetRow = typeof assets.$inferSelect;
// A slide with the pictures linked to it (the automatic one and the one the team supplied).
export type SlideWithPictures = typeof slides.$inferSelect & { asset: AssetRow | null; requiredImage: AssetRow | null };

type DetailsJson = { dates?: { day: string; month: string }[]; venue?: string; stand?: string } | null;

// Carousel slides use a different template for the cover, the middle slides and the closing slide.
const CAROUSEL_TEMPLATES: Record<string, TemplateName> = { cover: "info_cover", inner: "info_inner", cta: "info_cta" };

function templateFor(post: PostRow, slide: SlideWithPictures): TemplateName {
  if (post.template === "info_carousel") return CAROUSEL_TEMPLATES[slide.templateVariant] ?? "info_inner";
  return post.template as TemplateName;
}

// Turns one saved slide into what the renderer needs. Pure: no database or network.
// Pictures: a team-supplied "specific" photo replaces the automatic picture; an event logo goes in its own box.
// An empty required slot gives no URL, so the template shows its placeholder (the reviewer still sees the post).
export function buildRenderInput(post: PostRow, slide: SlideWithPictures, slideCount: number): RenderInput {
  const details = (slide.details ?? null) as DetailsJson;
  const photoUrl = slide.requiredImageKind === "specific" ? slide.requiredImage?.url : slide.asset?.url;
  const isCarousel = post.template === "info_carousel";
  return {
    template: templateFor(post, slide),
    fruit: post.fruit as RenderInput["fruit"],
    aspect: post.aspect as RenderInput["aspect"],
    eyebrow: slide.eyebrow ?? undefined,
    hero: slide.hero ?? undefined,
    sub: slide.sub ?? undefined,
    body: slide.body ?? undefined,
    photoUrl,
    eventLogoUrl: slide.requiredImageKind === "event_logo" ? slide.requiredImage?.url : undefined,
    dates: details?.dates,
    venue: details?.venue,
    stand: details?.stand,
    checklist: (slide.checklist as string[] | null) ?? undefined,
    progress: isCarousel ? { index: slide.idx, total: slideCount } : undefined,
  };
}
