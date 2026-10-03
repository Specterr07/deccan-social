"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { SuggestedDay } from "@/data/suggestedDays";
import type { CalendarEntryView } from "@/lib/entries/entryView";
import { answerSuggestion } from "./entryClient";
import { ImportPdfDialog } from "./ImportPdfDialog";
import { EntrySheet, type SheetTarget } from "./EntrySheet";
import { MonthGrid } from "./MonthGrid";
import { MonthSummaryCard } from "./MonthSummaryCard";
import { PlanPostsDialog, type SpendInfo } from "./PlanPostsDialog";
import { SuggestedDaysCard } from "./SuggestedDaysCard";

type Props = { monthId: string; month: string; entries: CalendarEntryView[]; suggestions: SuggestedDay[]; canEdit: boolean; hasPosts: boolean; spend: SpendInfo | null };

// The month planner: the grid, the "This month" card, the Add/Edit panel and the Plan dialog.
export function CalendarBuilder({ monthId, month, entries, suggestions, canEdit, hasPosts, spend }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<SheetTarget>(null);

  // Adds a suggested day to the calendar, or hides it for this month.
  async function answer(action: "add" | "dismiss", suggestion: SuggestedDay) {
    const result = await answerSuggestion(monthId, action, suggestion);
    if (!result.ok) { toast.error(result.message); return; }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div className="min-w-0 space-y-3"> {/* min-w-0 lets the grid scroll sideways inside this column instead of widening the page */}
        {entries.length === 0 && <p className="text-sm text-muted-foreground">Nothing planned yet. Press + on a day to add the first post, add a suggested day, or import a PDF.</p>}
        <MonthGrid month={month} entries={entries} suggestions={suggestions} canEdit={canEdit} onAdd={(date) => setTarget({ date })} onEdit={(entry) => canEdit && setTarget({ entry })} onAddSuggestion={(suggestion) => answer("add", suggestion)} onDismissSuggestion={(suggestion) => answer("dismiss", suggestion)} />
      </div>
      <aside className="space-y-4">
        <MonthSummaryCard entries={entries} />
        {canEdit && <PlanPostsDialog monthId={monthId} entries={entries} hasPosts={hasPosts} spend={spend} />}
        {canEdit && <ImportPdfDialog monthId={monthId} hasEntries={entries.length > 0} />}
        {canEdit && <SuggestedDaysCard suggestions={suggestions} onAdd={(suggestion) => answer("add", suggestion)} onDismiss={(suggestion) => answer("dismiss", suggestion)} />}
      </aside>
      <EntrySheet monthId={monthId} target={target} onClose={() => setTarget(null)} onSaved={() => { setTarget(null); router.refresh(); }} />
    </div>
  );
}
