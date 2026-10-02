import { z } from "zod";

// The shape Claude must return. Kept deliberately plain (no length limits here) so the JSON schema sent
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
});

const postShape = z.object({
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

export const monthPlanShape = z.object({
  month: z.string(), // YYYY-MM
  posts: z.array(postShape),
});

export type MonthPlan = z.infer<typeof monthPlanShape>;
export type PlanPost = MonthPlan["posts"][number];
export type PlanSlide = PlanPost["slides"][number];
