import { z } from "zod";

// The shapes of a plan. Kept deliberately plain (no length limits here) so the JSON schema sent
// to Claude stays simple; the strict limits are checked afterwards by `checkMonthPlan` (planRules.ts),
// which gives readable messages and lets us ask Claude to fix them.

const slideShape = z.object({
  variant: z.enum(["single", "cover", "inner", "cta"]),
  eyebrow: z.string().optional(),
  hero: z.string(),
  sub: z.string().optional(),
  body: z.string().optional(),
  // Exhibition facts: only what the calendar states.
  dates: z.array(z.object({ day: z.string(), month: z.string() })).optional(),
  venue: z.string().optional(),
  stand: z.string().optional(),
  checklist: z.array(z.string()).optional(),
  // Picture search words (library first) and, only when no library photo will do, an artwork scene.
  photo_tags: z.array(z.string()),
  artwork_prompt: z.string().optional(),
  // A picture that must be exactly right. Present only when the slide needs one (ADR-014); never filled by AI.
  required_image: z.object({
    kind: z.enum(["event_logo", "specific"]),
    description: z.string(), // what to upload, e.g. "Event logo for World Fresh Produce Expo"
    library_name: z.string().optional(), // only if the calendar's Image column names a library image
  }).optional(),
});

const postShape = z.object({
  entry_id: z.string(), // the calendar entry this post was planned from
  date: z.string(), // YYYY-MM-DD
  time: z.string().optional(), // HH:MM IST; omitted = 10:00
  kind: z.enum(["festival", "day_of", "exhibition", "informative", "bts"]),
  fruit: z.enum(["pomegranate", "mango", "grape", "citrus", "none"]),
  aspect: z.enum(["4:5", "1:1"]),
  platforms: z.array(z.enum(["instagram", "linkedin"])),
  caption_instagram: z.string(),
  caption_linkedin: z.string(),
  rationale: z.string(),
  slides: z.array(slideShape),
});

// What Claude returns: only the words (ADR-015). Everything factual (date, time, kind, aspect, platforms, exhibition
// days / city / stand, required images) is copied from the calendar entry by code in `resolvePlan`.
const answerSlideShape = slideShape.omit({ dates: true, venue: true, stand: true, required_image: true });
const answerPostShape = postShape.pick({ entry_id: true, fruit: true, caption_instagram: true, caption_linkedin: true, rationale: true })
  .extend({ slides: z.array(answerSlideShape) });
export const planAnswerShape = z.object({ posts: z.array(answerPostShape) });
export type PlanAnswerData = z.infer<typeof planAnswerShape>;
export type AnswerPost = PlanAnswerData["posts"][number];

// The full plan after the entries' facts have been added. This is what the limit checks and `savePlan` use.
export const monthPlanShape = z.object({
  month: z.string(), // YYYY-MM
  posts: z.array(postShape),
});

export type MonthPlan = z.infer<typeof monthPlanShape>;
export type PlanPost = MonthPlan["posts"][number];
export type PlanSlide = PlanPost["slides"][number];
