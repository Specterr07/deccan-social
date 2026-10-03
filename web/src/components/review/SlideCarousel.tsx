"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CarouselSlide = { id: string; renderUrl: string | null; hero: string | null };

// The drawn slides of one post, one at a time, with previous / next buttons and a "Slide 2 of 4" label (not only dots).
export function SlideCarousel({ slides, aspect }: { slides: CarouselSlide[]; aspect: string }) {
  const [position, setPosition] = useState(0);
  const current = slides[position];
  const aspectClass = aspect === "1:1" ? "aspect-square" : "aspect-[4/5]";

  return (
    <div className="space-y-2">
      <div className={`relative w-full overflow-hidden rounded-lg border bg-muted ${aspectClass}`}>
        {current?.renderUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- R2 image, no Next optimiser
          <img src={current.renderUrl} alt={`Slide ${position + 1}: ${current.hero ?? "post"}`} className="size-full object-cover" />
        ) : (
          <p className="flex size-full items-center justify-center text-sm text-muted-foreground">Not drawn yet</p>
        )}
      </div>
      {slides.length > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setPosition(position - 1)} disabled={position === 0} aria-label="Previous slide"><ChevronLeft aria-hidden="true" /></Button>
          <p className="text-sm text-muted-foreground" aria-live="polite">Slide {position + 1} of {slides.length}</p>
          <Button variant="outline" size="icon-sm" onClick={() => setPosition(position + 1)} disabled={position === slides.length - 1} aria-label="Next slide"><ChevronRight aria-hidden="true" /></Button>
        </div>
      )}
    </div>
  );
}
