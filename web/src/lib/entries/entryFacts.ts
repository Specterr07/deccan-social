import type { ExhibitionDetails, InformativeDetails } from "@/schemas/entries";
import { LIMITS } from "@/schemas/limits";

// The facts of an entry that planning copies onto the post. Kept here so the planner, the post saver and the checks agree.

type RequiredImage = { kind: "event_logo" | "specific"; description: string };

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

// Which picture the person must supply for this kind of entry, and how the slot is described (null = none needed).
export function requiredImageFor(kind: string, title: string): RequiredImage | null {
  if (kind === "exhibition") return { kind: "event_logo", description: truncate(`Event logo for ${title}`, LIMITS.requiredImageDescription) };
  if (kind === "bts") return { kind: "specific", description: truncate(`Photo for ${title}`, LIMITS.requiredImageDescription) };
  return null;
}

const MONTH_ABBREVIATIONS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// "2026-11-04" → { day: "04", month: "NOV" }
function dateBox(isoDate: string): { day: string; month: string } {
  const [, month, day] = isoDate.split("-");
  return { day, month: MONTH_ABBREVIATIONS[Number(month) - 1] };
}

// One date box per day for short events; longer events show only the first and last day (the template fits 4 boxes).
export function exhibitionDateBoxes(details: ExhibitionDetails): { day: string; month: string }[] {
  const dayCount = Math.round((Date.parse(details.lastDay) - Date.parse(details.firstDay)) / 86400000) + 1;
  if (dayCount <= LIMITS.dates.max) {
    return Array.from({ length: dayCount }, (_, offset) => dateBox(new Date(Date.parse(details.firstDay) + offset * 86400000).toISOString().slice(0, 10)));
  }
  return [dateBox(details.firstDay), dateBox(details.lastDay)];
}

export function asExhibitionDetails(details: unknown): ExhibitionDetails {
  return details as ExhibitionDetails; // validated by entryInputSchema when the entry was saved
}

export function asInformativeDetails(details: unknown): InformativeDetails {
  return details as InformativeDetails;
}
