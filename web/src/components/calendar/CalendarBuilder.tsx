"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CalendarEntryView } from "@/lib/entries/entryView";
import { EntrySheet, type SheetTarget } from "./EntrySheet";
import { MonthGrid } from "./MonthGrid";
import { MonthSummaryCard } from "./MonthSummaryCard";
import { PlanPostsDialog, type SpendInfo } from "./PlanPostsDialog";

type Props = { monthId: string; month: string; entries: CalendarEntryView[]; canEdit: boolean; hasPosts: boolean; spend: SpendInfo | null };

// The month planner: the grid, the "This month" card, the Add/Edit panel and the Plan dialog.
export function CalendarBuilder({ monthId, month, entries, canEdit, hasPosts, spend }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<SheetTarget>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-3">
        {entries.length === 0 && <p className="text-sm text-muted-foreground">Nothing planned yet. Press + on a day to add the first post.</p>}
        <MonthGrid month={month} entries={entries} canEdit={canEdit} onAdd={(date) => setTarget({ date })} onEdit={(entry) => canEdit && setTarget({ entry })} />
      </div>
      <aside className="space-y-4">
        <MonthSummaryCard entries={entries} />
        {canEdit && <PlanPostsDialog monthId={monthId} entries={entries} hasPosts={hasPosts} spend={spend} />}
      </aside>
      <EntrySheet monthId={monthId} target={target} onClose={() => setTarget(null)} onSaved={() => { setTarget(null); router.refresh(); }} />
    </div>
  );
}
