// Character and count limits for every text field on a post.
// Measured from the real templates; the human-readable version (with the reasoning) is docs/CONTENT-LIMITS.md.
// KEEP BOTH IN SYNC: change a number here, change it there.

export const LIMITS = {
  eyebrow: 32,
  heroFestival: 18, // festival and day-of names, shown at 120 px uppercase
  heroExhibition: 45,
  heroBehindTheScenes: 60,
  heroCover: 60,
  heroInner: 40,
  heroCta: 55,
  sub: 60,
  bodyGreeting: 120, // festival / day-of
  bodyInner: 160,
  bodyInnerWords: 35,
  checklistItems: { min: 2, max: 4 },
  checklistItemChars: 40,
  venue: 28,
  stand: 28,
  dates: { min: 1, max: 4 },
  carouselSlides: { min: 3, max: 6 },
  postsPerMonth: 31,
  captionInstagram: { min: 300, max: 900 },
  hashtagsInstagram: { min: 5, max: 10 },
  captionLinkedin: { min: 300, max: 1200 },
  hashtagsLinkedin: { min: 3, max: 5 },
  rationale: 200,
  photoTags: { min: 1, max: 6 },
  artworkPrompt: 280,
  requiredImageDescription: 60,
  libraryName: 60,
  // Calendar entries (what the person types before planning). Mirrored in docs/CONTENT-LIMITS.md.
  entryTitle: 60,
  entryNotes: 300,
  entryCity: 28, // becomes the venue on the post, so it shares venue's limit
  entryStand: 28,
  entryPoints: { max: 6 },
  entryPointChars: 80,
  exhibitionDays: { max: 14 }, // longer than two weeks is probably a typo
} as const;

export const DEFAULT_POST_TIME = "10:00"; // IST, unless the calendar says otherwise

export type PostKind = "festival" | "day_of" | "exhibition" | "informative" | "bts";
export type SlideVariant = "single" | "cover" | "inner" | "cta";

// Max length of a slide's headline depends on which template draws it.
export function heroLimit(kind: PostKind, variant: SlideVariant): number {
  if (kind === "festival" || kind === "day_of") return LIMITS.heroFestival;
  if (kind === "exhibition") return LIMITS.heroExhibition;
  if (kind === "bts") return LIMITS.heroBehindTheScenes;
  if (variant === "cover") return LIMITS.heroCover;
  if (variant === "cta") return LIMITS.heroCta;
  return LIMITS.heroInner;
}
