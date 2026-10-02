import { z } from "zod";

// Everything the renderer needs to draw one slide. The planner (T-03) and the review page (T-06)
// build this from a `slides` row + its `posts` row; the renderer never touches the database.
export const templateNames = [
  "festival", "day_of", "exhibition", "behind_the_scenes", "info_cover", "info_inner", "info_cta",
] as const;

export const fruitNames = ["pomegranate", "mango", "grape", "citrus", "none"] as const;

export const renderInputSchema = z.object({
  template: z.enum(templateNames),
  fruit: z.enum(fruitNames).default("none"),
  aspect: z.enum(["4:5", "1:1"]).default("4:5"),
  eyebrow: z.string().optional(),
  hero: z.string().optional(),
  sub: z.string().optional(),
  body: z.string().optional(),
  // Picture for the slide: "/brand/…" path (library seed photos) or an https URL (R2). Missing → plain tint block.
  photoUrl: z.string().optional(),
  // Exhibition only
  eventLogoUrl: z.string().optional(),
  dates: z.array(z.object({ day: z.string(), month: z.string() })).optional(),
  venue: z.string().optional(),
  stand: z.string().optional(),
  // Carousel only
  checklist: z.array(z.string()).optional(),
  progress: z.object({ index: z.number().int().min(0), total: z.number().int().min(1) }).optional(),
});

export type RenderInput = z.infer<typeof renderInputSchema>;
export type TemplateName = (typeof templateNames)[number];
