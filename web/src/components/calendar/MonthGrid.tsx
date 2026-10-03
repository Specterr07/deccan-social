import { Plus, X } from "lucide-react";
import type { SuggestedDay } from "@/data/suggestedDays";
import type { CalendarEntryView } from "@/lib/entries/entryView";
import { entryNeedsImage } from "@/schemas/entries";
import { buildMonthGrid } from "@/lib/months/calendarGrid";
import { KIND_CHIP_CLASSES, KIND_LABELS } from "./kindStyles";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  month: string; entries: CalendarEntryView[]; suggestions: SuggestedDay[]; canEdit: boolean;
  onAdd: (date: string) => void; onEdit: (entry: CalendarEntryView) => void;
  onAddSuggestion: (suggestion: SuggestedDay) => void; onDismissSuggestion: (suggestion: SuggestedDay) => void;
};

// Month grid, Monday to Sunday. Each post is a chip with its type written out; empty days offer "Add post".
// On a phone the grid scrolls sideways instead of squeezing the chips.
export function MonthGrid({ month, entries, suggestions, canEdit, onAdd, onEdit, onAddSuggestion, onDismissSuggestion }: Props) {
  const weeks = buildMonthGrid(month);
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <div className="grid min-w-[44rem] grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((weekday) => <div key={weekday} className="p-2">{weekday}</div>)}
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid min-w-[44rem] grid-cols-7 border-b last:border-0">
          {week.map((cell, cellIndex) => {
            if (!cell) return <div key={cellIndex} className="min-h-24 border-r bg-muted/40 last:border-0" />;
            const dayEntries = entries.filter((entry) => entry.date === cell.date);
            const daySuggestions = suggestions.filter((suggestion) => suggestion.date === cell.date);
            return (
              <div key={cell.date} className="group min-h-24 space-y-1 border-r p-1.5 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{cell.day}</span>
                  {canEdit && dayEntries.length === 0 && (
                    <button type="button" onClick={() => onAdd(cell.date)} aria-label={`Add post on ${cell.day}`} className="rounded p-0.5 text-muted-foreground opacity-60 hover:bg-accent hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100">
                      <Plus aria-hidden="true" className="size-4" />
                    </button>
                  )}
                </div>
                {dayEntries.map((entry) => (
                  <button key={entry.id} type="button" onClick={() => onEdit(entry)} className={`block w-full rounded-md border-l-4 p-1.5 text-left text-xs hover:brightness-95 focus-visible:outline-2 focus-visible:outline-ring ${KIND_CHIP_CLASSES[entry.kind] ?? ""}`}>
                    <span className="block font-medium uppercase tracking-wide text-muted-foreground">{KIND_LABELS[entry.kind] ?? entry.kind}</span>
                    <span className="block truncate">{entry.title}</span>
                    {entryNeedsImage(entry.kind) && !entry.image && <span className="block font-medium text-destructive">Needs image</span>}
                  </button>
                ))}
                {canEdit && daySuggestions.map((suggestion) => (
                  <div key={suggestion.title} className="relative rounded-md border border-dashed p-1.5 text-xs">
                    <button type="button" onClick={() => onAddSuggestion(suggestion)} className="block w-full pr-4 text-left hover:underline focus-visible:outline-2 focus-visible:outline-ring" title={suggestion.note}>
                      <span className="block font-medium uppercase tracking-wide text-muted-foreground">Suggested</span>
                      <span className="block">{suggestion.title}</span>
                      <span className="block text-muted-foreground">+ Add</span>
                    </button>
                    <button type="button" onClick={() => onDismissSuggestion(suggestion)} aria-label={`Dismiss ${suggestion.title}`} className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground hover:bg-accent">
                      <X aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                ))}
                {canEdit && dayEntries.length > 0 && (
                  <button type="button" onClick={() => onAdd(cell.date)} className="text-xs text-muted-foreground underline-offset-2 hover:underline">Add another</button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
