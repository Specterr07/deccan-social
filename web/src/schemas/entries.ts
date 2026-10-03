import { z } from "zod";
import { LIMITS } from "./limits";

// A calendar entry is one post the person plans to publish. These schemas check what the browser sends
// (the "Add post" panel) before anything is saved. Facts typed here are copied onto the post by code.

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date").refine((value) => !Number.isNaN(Date.parse(value)), "That is not a real date");
const postTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must look like 10:00");
const trimmed = (max: number, label: string) => z.string().trim().min(1, `${label} is required`).max(max, `${label} can be at most ${max} characters`);
const optionalTrimmed = (max: number, label: string) => z.string().trim().max(max, `${label} can be at most ${max} characters`).optional().transform((value) => value || undefined);

export const FRUITS = ["pomegranate", "mango", "grape", "citrus"] as const;
export const ENTRY_KINDS = ["festival", "day_of", "exhibition", "informative", "bts"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

const exhibitionDetails = z.object({
  firstDay: isoDate,
  lastDay: isoDate,
  city: trimmed(LIMITS.entryCity, "City"),
  stand: optionalTrimmed(LIMITS.entryStand, "Hall / stand"),
}).refine((value) => value.lastDay >= value.firstDay, { message: "The last day cannot be before the first day", path: ["lastDay"] });

const informativeDetails = z.object({
  fruit: z.enum(FRUITS).optional(),
  points: z.array(trimmed(LIMITS.entryPointChars, "A point")).max(LIMITS.entryPoints.max, `At most ${LIMITS.entryPoints.max} points`).optional(),
  slideCount: z.number().int().min(LIMITS.carouselSlides.min).max(LIMITS.carouselSlides.max),
});

const common = {
  date: isoDate,
  title: trimmed(LIMITS.entryTitle, "Title"),
  notes: optionalTrimmed(LIMITS.entryNotes, "Notes"),
  aspect: z.enum(["4:5", "1:1"]).default("4:5"),
  time: postTime.optional(),
  platforms: z.array(z.enum(["instagram", "linkedin"])).min(1, "Choose at least one platform").default(["instagram", "linkedin"]),
  requiredImageAssetId: z.string().uuid().nullable().optional(),
};

export const entryInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("festival"), ...common }),
  z.object({ kind: z.literal("day_of"), ...common }),
  z.object({ kind: z.literal("exhibition"), ...common, details: exhibitionDetails }),
  z.object({ kind: z.literal("informative"), ...common, details: informativeDetails }),
  z.object({ kind: z.literal("bts"), ...common }),
]).refine((entry) => entry.aspect === "4:5" || entry.kind === "festival" || entry.kind === "day_of", {
  message: "1:1 is only available for festival and day-of posts", path: ["aspect"],
});

export type EntryInput = z.infer<typeof entryInputSchema>;
export type ExhibitionDetails = z.infer<typeof exhibitionDetails>;
export type InformativeDetails = z.infer<typeof informativeDetails>;

// Does this kind of post need a picture only the person can supply (event logo / behind-the-scenes photo)?
export function entryNeedsImage(kind: string): boolean {
  return kind === "exhibition" || kind === "bts";
}

// First readable problem from a failed check, for the panel to show.
export function firstProblem(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue.path.length > 0 && issue.message === "Invalid input" ? `Check the ${issue.path.join(" ")} field` : issue.message;
}
