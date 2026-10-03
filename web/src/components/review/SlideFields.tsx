"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS, heroLimit, type PostKind, type SlideVariant } from "@/schemas/limits";

export type SlideEdit = { id: string; variant: string; eyebrow: string; hero: string; sub: string; body: string; checklist: string[] };

// "12 / 18" under a field; turns red and says so in words when over the limit.
function Counter({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return <p className={`text-xs ${over ? "font-medium text-destructive" : "text-muted-foreground"}`}>{value.length} / {limit}{over ? " — too long" : ""}</p>;
}

type Props = { kind: string; slide: SlideEdit; index: number; total: number; onChange: (changes: Partial<SlideEdit>) => void };

// The text fields of one slide. Facts (dates, venue, stand) are not here: they come from the calendar entry.
export function SlideFields({ kind, slide, index, total, onChange }: Props) {
  const bodyLimit = kind === "festival" || kind === "day_of" ? LIMITS.bodyGreeting : LIMITS.bodyInner;
  const hasBody = slide.variant !== "cover" && kind !== "exhibition" && kind !== "bts" && slide.variant !== "cta";
  const id = (name: string) => `${name}-${slide.id}`;
  return (
    <fieldset className="space-y-3 rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">{total > 1 ? `Slide ${index + 1} of ${total}` : "Text on the post"}</legend>
      <div className="space-y-1"><Label htmlFor={id("eyebrow")}>Small line above</Label><Input id={id("eyebrow")} value={slide.eyebrow} onChange={(event) => onChange({ eyebrow: event.target.value })} /><Counter value={slide.eyebrow} limit={LIMITS.eyebrow} /></div>
      <div className="space-y-1"><Label htmlFor={id("hero")}>Headline</Label><Input id={id("hero")} value={slide.hero} onChange={(event) => onChange({ hero: event.target.value })} /><Counter value={slide.hero} limit={heroLimit(kind as PostKind, slide.variant as SlideVariant)} /></div>
      {slide.variant === "cover" && <div className="space-y-1"><Label htmlFor={id("sub")}>Line under the headline</Label><Input id={id("sub")} value={slide.sub} onChange={(event) => onChange({ sub: event.target.value })} /><Counter value={slide.sub} limit={LIMITS.sub} /></div>}
      {hasBody && <div className="space-y-1"><Label htmlFor={id("body")}>Text</Label><Textarea id={id("body")} rows={3} value={slide.body} onChange={(event) => onChange({ body: event.target.value })} /><Counter value={slide.body} limit={bodyLimit} /></div>}
      {slide.variant === "cta" && (
        <div className="space-y-1">
          <Label htmlFor={id("checklist")}>Checklist (one point per line)</Label>
          <Textarea id={id("checklist")} rows={4} value={slide.checklist.join("\n")} onChange={(event) => onChange({ checklist: event.target.value.split("\n") })} />
          <p className="text-xs text-muted-foreground">{LIMITS.checklistItems.min}–{LIMITS.checklistItems.max} points, up to {LIMITS.checklistItemChars} characters each.</p>
        </div>
      )}
    </fieldset>
  );
}
