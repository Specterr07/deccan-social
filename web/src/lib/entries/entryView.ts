import type { EntryWithImage } from "./queries";

// The plain shape the calendar screens work with (no Date objects, so it passes from server to browser unchanged).
export type CalendarEntryView = {
  id: string;
  date: string; // YYYY-MM-DD
  kind: string;
  title: string;
  details: unknown;
  notes: string | null;
  aspect: string;
  time: string | null; // HH:MM
  platforms: string[];
  image: { id: string; url: string; name: string } | null; // the event logo / behind-the-scenes photo
};

export function toEntryView(entry: EntryWithImage): CalendarEntryView {
  return {
    id: entry.id, date: entry.date, kind: entry.kind, title: entry.title, details: entry.details, notes: entry.notes,
    aspect: entry.aspect, time: entry.time ? entry.time.slice(0, 5) : null, platforms: entry.platforms,
    image: entry.requiredImage ? { id: entry.requiredImage.id, url: entry.requiredImage.url, name: entry.requiredImage.name } : null,
  };
}
