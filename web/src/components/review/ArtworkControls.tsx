"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/components/calendar/formatMoney";
import { regenerateArtwork, swapPicture } from "./reviewClient";
import type { ReviewPost } from "./types";

export type ArtworkBudget = { costInr: number; spentInr: number; capInr: number };
type ReviewSlide = ReviewPost["slides"][number];

// The artwork choices of ONE slide: its earlier pictures (click to switch back, free) and "Try another picture" (paid, cost shown).
function SlideArtwork({ slide, label, budget }: { slide: ReviewSlide; label: string; budget: ArtworkBudget }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const variants = slide.generations.filter((generation) => generation.asset);

  async function run(action: () => Promise<{ ok: true } | { ok: false; message: string }>, doneMessage: string) {
    setIsBusy(true);
    const result = await action();
    setIsBusy(false);
    if (!result.ok) { toast.error(result.message, { duration: 8000 }); return; }
    toast.success(doneMessage);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {variants.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {variants.map((generation) => {
            const isCurrent = generation.asset!.id === slide.assetId;
            return (
              <li key={generation.id}>
                <button type="button" disabled={isBusy || isCurrent} aria-pressed={isCurrent} onClick={() => run(() => swapPicture(slide.id, generation.asset!.id), "Picture changed.")} className={`space-y-1 rounded-lg border p-1 text-center text-xs ${isCurrent ? "border-primary" : "hover:bg-accent"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- R2 image, no Next optimiser */}
                  <img src={generation.asset!.url} alt={`Artwork option ${generation.variant}`} className="h-20 w-16 rounded object-cover" />
                  <span className="block">{isCurrent ? "In use" : "Use this"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Button variant="outline" size="sm" disabled={isBusy} onClick={() => run(() => regenerateArtwork(slide.id), "New picture made and used.")}>
        <Sparkles aria-hidden="true" /> {isBusy ? "Working…" : "Try another picture"}
      </Button>
      <p className="text-xs text-muted-foreground">Costs about {formatRupees(budget.costInr)}. AI spend this month: {formatRupees(budget.spentInr)} of {formatRupees(budget.capInr)}.</p>
    </div>
  );
}

// "Pictures": one section per slide that can have artwork (slides using a photo from your team are left out).
export function ArtworkControls({ post, budget }: { post: ReviewPost; budget: ArtworkBudget }) {
  const artworkSlides = post.slides.filter((slide) => slide.requiredImageKind !== "specific" && slide.artworkPrompt);
  if (artworkSlides.length === 0) return null;
  return (
    <details className="rounded-lg border p-3">
      <summary className="cursor-pointer text-sm font-medium">Pictures{artworkSlides.length > 1 ? ` (${artworkSlides.length} slides)` : ""}</summary>
      <div className="mt-3 space-y-4">
        {artworkSlides.map((slide) => <SlideArtwork key={slide.id} slide={slide} label={post.slides.length > 1 ? `Slide ${slide.idx + 1}` : "Picture"} budget={budget} />)}
      </div>
    </details>
  );
}
