"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS } from "@/schemas/limits";
import { saveEdit } from "./reviewClient";
import { SlideFields, type SlideEdit } from "./SlideFields";
import type { ReviewPost } from "./types";

// "Edit text": change the words on the slides and the captions. Saving redraws only this post.
export function EditPostSheet({ post }: { post: ReviewPost }) {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline"><Pencil aria-hidden="true" /> Edit text</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg"><EditForm post={post} /></SheetContent>
    </Sheet>
  );
}

function EditForm({ post }: { post: ReviewPost }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [instagram, setInstagram] = useState(post.captionInstagram ?? "");
  const [linkedin, setLinkedin] = useState(post.captionLinkedin ?? "");
  const [slideEdits, setSlideEdits] = useState<SlideEdit[]>(() => post.slides.map((slide) => ({
    id: slide.id, variant: slide.templateVariant, eyebrow: slide.eyebrow ?? "", hero: slide.hero ?? "", sub: slide.sub ?? "", body: slide.body ?? "",
    checklist: (slide.checklist as string[] | null) ?? [],
  })));

  function changeSlide(index: number, changes: Partial<SlideEdit>) {
    setSlideEdits((current) => current.map((slide, position) => (position === index ? { ...slide, ...changes } : slide)));
  }

  async function save() {
    setIsSaving(true);
    const result = await saveEdit(post.id, {
      captionInstagram: instagram, captionLinkedin: linkedin,
      slides: slideEdits.map(({ id, eyebrow, hero, sub, body, checklist }) => ({ id, eyebrow, hero, sub, body, checklist: checklist.map((line) => line.trim()).filter(Boolean) })),
    });
    setIsSaving(false);
    if (!result.ok) { toast.error(result.message, { duration: 10000 }); return; }
    toast.success("Saved. The post was drawn again.");
    router.refresh();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit text</SheetTitle>
        <SheetDescription>Dates, venue and stand come from the calendar and cannot be changed here. Saving redraws this post and asks for a fresh approval.</SheetDescription>
      </SheetHeader>
      <div className="space-y-4 px-4">
        {slideEdits.map((slide, index) => <SlideFields key={slide.id} kind={post.kind} slide={slide} index={index} total={slideEdits.length} onChange={(changes) => changeSlide(index, changes)} />)}
        <div className="space-y-1"><Label htmlFor="caption-instagram">Instagram caption</Label><Textarea id="caption-instagram" rows={7} value={instagram} onChange={(event) => setInstagram(event.target.value)} /><p className="text-xs text-muted-foreground">{instagram.length} characters ({LIMITS.captionInstagram.min}–{LIMITS.captionInstagram.max}), {LIMITS.hashtagsInstagram.min}–{LIMITS.hashtagsInstagram.max} hashtags</p></div>
        <div className="space-y-1"><Label htmlFor="caption-linkedin">LinkedIn caption</Label><Textarea id="caption-linkedin" rows={7} value={linkedin} onChange={(event) => setLinkedin(event.target.value)} /><p className="text-xs text-muted-foreground">{linkedin.length} characters ({LIMITS.captionLinkedin.min}–{LIMITS.captionLinkedin.max}), {LIMITS.hashtagsLinkedin.min}–{LIMITS.hashtagsLinkedin.max} hashtags</p></div>
      </div>
      <SheetFooter><Button onClick={save} disabled={isSaving}>{isSaving ? "Saving and redrawing…" : "Save and redraw"}</Button></SheetFooter>
    </>
  );
}
