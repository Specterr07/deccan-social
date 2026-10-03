"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { estimatePlanCostUsd } from "@/lib/ai/planCost";
import type { CalendarEntryView } from "@/lib/entries/entryView";
import { entryNeedsImage } from "@/schemas/entries";
import { startPlanning } from "./entryClient";
import { formatRupees } from "./formatMoney";
import { KIND_LABELS } from "./kindStyles";

export type SpendInfo = { totalInr: number; capInr: number; usdInrRate: number };

type Props = { monthId: string; entries: CalendarEntryView[]; hasPosts: boolean; spend: SpendInfo | null };

// "Plan N posts": shows every entry (Ready / Needs image), what planning is expected to cost, then starts the plan job.
export function PlanPostsDialog({ monthId, entries, hasPosts, spend }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const estimateInr = spend ? estimatePlanCostUsd(entries.length) * spend.usdInrRate : null;

  async function plan() {
    setIsStarting(true);
    const result = await startPlanning(monthId);
    setIsStarting(false);
    if (!result.ok) { toast.error(result.message); return; }
    setIsOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button disabled={entries.length === 0}>{hasPosts ? "Plan again" : `Plan ${entries.length} ${entries.length === 1 ? "post" : "posts"}`}</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plan {entries.length} {entries.length === 1 ? "post" : "posts"}</DialogTitle>
          <DialogDescription>
            We write the headline, text and captions for each post. {hasPosts ? "This replaces the posts planned earlier." : "Posts that need an image will wait for it."}
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-64 divide-y overflow-y-auto rounded-lg border text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 p-2">
              <span className="min-w-0 truncate"><span className="text-muted-foreground">{entry.date.slice(8)} · {KIND_LABELS[entry.kind]} · </span>{entry.title}</span>
              {entryNeedsImage(entry.kind) && !entry.image ? <Badge variant="destructive">Needs image</Badge> : <Badge variant="secondary">Ready</Badge>}
            </li>
          ))}
        </ul>
        {spend && estimateInr !== null && (
          <p className="text-sm text-muted-foreground">
            Estimated cost <strong className="text-foreground">about {formatRupees(estimateInr)}</strong>. AI spend this month: {formatRupees(spend.totalInr)} of {formatRupees(spend.capInr)}.
          </p>
        )}
        <Button onClick={plan} disabled={isStarting}>{isStarting ? "Starting…" : "Plan posts"}</Button>
      </DialogContent>
    </Dialog>
  );
}
