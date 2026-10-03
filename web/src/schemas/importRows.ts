import { z } from "zod";

// What Claude returns when it reads a calendar PDF: one flat row per post. Facts are copied as written.
// Rows are turned into calendar entries (and checked against the entry rules) by code in lib/months/importFromPdf.ts.
const importRowShape = z.object({
  date: z.string(), // the day to post, YYYY-MM-DD
  type: z.enum(["festival", "day_of", "exhibition", "informative", "bts"]),
  title: z.string(), // festival / day / event name, carousel topic, or what the behind-the-scenes photo shows
  notes: z.string().optional(),
  aspect: z.enum(["4:5", "1:1"]).optional(), // "1:1" only if the calendar says square
  time: z.string().optional(), // HH:MM, only if the calendar gives one
  exhibition_first_day: z.string().optional(), // YYYY-MM-DD
  exhibition_last_day: z.string().optional(), // YYYY-MM-DD
  city: z.string().optional(),
  stand: z.string().optional(), // hall / stand exactly as written
  fruit: z.enum(["pomegranate", "mango", "grape", "citrus"]).optional(),
  points: z.array(z.string()).optional(),
  slide_count: z.number().optional(),
  image: z.string().optional(), // the Image column: a library name (lower-case-with-hyphens) or "will upload"
});

export const importAnswerShape = z.object({ rows: z.array(importRowShape) });
export type ImportRow = z.infer<typeof importRowShape>;
