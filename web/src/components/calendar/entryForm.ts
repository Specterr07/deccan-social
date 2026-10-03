import type { CalendarEntryView } from "@/lib/entries/entryView";
import { LIMITS } from "@/schemas/limits";

// The "Add post" panel keeps everything as text while the person types; `formToPayload` turns it into what the API checks.
export type EntryForm = {
  kind: string; date: string; title: string; notes: string; aspect: string; time: string;
  instagram: boolean; linkedin: boolean;
  firstDay: string; lastDay: string; city: string; stand: string; // exhibition
  fruit: string; points: string; slideCount: string; // carousel (points: one per line)
  image: { id: string; url: string; name: string } | null; // event logo / behind-the-scenes photo
};

export function emptyForm(date: string): EntryForm {
  return {
    kind: "festival", date, title: "", notes: "", aspect: "4:5", time: "", instagram: true, linkedin: true,
    firstDay: date, lastDay: date, city: "", stand: "", fruit: "", points: "", slideCount: String(LIMITS.carouselSlides.min + 1), image: null,
  };
}

type Details = Record<string, unknown>;

export function formFromEntry(entry: CalendarEntryView): EntryForm {
  const details = (entry.details ?? {}) as Details;
  return {
    ...emptyForm(entry.date),
    kind: entry.kind, title: entry.title, notes: entry.notes ?? "", aspect: entry.aspect, time: entry.time ?? "",
    instagram: entry.platforms.includes("instagram"), linkedin: entry.platforms.includes("linkedin"),
    firstDay: String(details.firstDay ?? entry.date), lastDay: String(details.lastDay ?? entry.date),
    city: String(details.city ?? ""), stand: String(details.stand ?? ""),
    fruit: String(details.fruit ?? ""), points: ((details.points as string[] | undefined) ?? []).join("\n"),
    slideCount: String(details.slideCount ?? LIMITS.carouselSlides.min + 1), image: entry.image,
  };
}

function detailsFor(form: EntryForm): Record<string, unknown> | undefined {
  if (form.kind === "exhibition") return { details: { firstDay: form.firstDay, lastDay: form.lastDay, city: form.city, stand: form.stand } };
  if (form.kind === "informative") {
    const points = form.points.split("\n").map((line) => line.trim()).filter(Boolean);
    return { details: { fruit: form.fruit || undefined, points: points.length > 0 ? points : undefined, slideCount: Number(form.slideCount) } };
  }
  return undefined;
}

// Builds the JSON the API expects. Wrong values are rejected by the server with a readable message.
export function formToPayload(form: EntryForm) {
  return {
    kind: form.kind, date: form.date, title: form.title, notes: form.notes, aspect: form.aspect, time: form.time || undefined,
    platforms: [form.instagram && "instagram", form.linkedin && "linkedin"].filter(Boolean),
    requiredImageAssetId: form.image?.id ?? null,
    ...detailsFor(form),
  };
}
