import { z } from "zod";

// What the "Edit text" panel sends. Only words can change here: dates, venue, stand, pictures and the post type
// come from the calendar entry and are not editable on a post.
export const postEditSchema = z.object({
  captionInstagram: z.string(),
  captionLinkedin: z.string(),
  slides: z.array(z.object({
    id: z.string().uuid(),
    eyebrow: z.string().optional(),
    hero: z.string(),
    sub: z.string().optional(),
    body: z.string().optional(),
    checklist: z.array(z.string()).optional(),
  })).min(1),
});

export type PostEdit = z.infer<typeof postEditSchema>;
