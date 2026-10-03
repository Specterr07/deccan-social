import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalendarEntryView } from "@/lib/entries/entryView";
import { entryNeedsImage } from "@/schemas/entries";
import { KIND_LABELS } from "./kindStyles";

// "This month": how many posts of each type, and how many still need an image from the team.
export function MonthSummaryCard({ entries }: { entries: CalendarEntryView[] }) {
  const missingImages = entries.filter((entry) => entryNeedsImage(entry.kind) && !entry.image).length;
  return (
    <Card>
      <CardHeader><CardTitle>This month</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p><strong className="text-lg">{entries.length}</strong> {entries.length === 1 ? "post" : "posts"} planned</p>
        <ul className="space-y-1">
          {Object.entries(KIND_LABELS).map(([kind, label]) => (
            <li key={kind} className="flex justify-between"><span>{label}</span><span>{entries.filter((entry) => entry.kind === kind).length}</span></li>
          ))}
        </ul>
        <p className={missingImages > 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
          {missingImages > 0 ? `${missingImages} ${missingImages === 1 ? "post still needs" : "posts still need"} an image` : "No images missing"}
        </p>
      </CardContent>
    </Card>
  );
}
