"use client";

import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FRUITS } from "@/schemas/entries";
import { LIMITS } from "@/schemas/limits";
import { EntryImageField } from "./EntryImageField";
import type { EntryForm } from "./entryForm";

const SELECT_CLASSES = "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type Props = { form: EntryForm; onChange: (changes: Partial<EntryForm>) => void };

// Only the fields that belong to the chosen kind of post (exhibition: days, city, stand, logo; carousel: topic points…).
export function KindSpecificFields({ form, onChange }: Props) {
  if (form.kind === "exhibition") {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstDay" label="First day"><Input id="firstDay" type="date" value={form.firstDay} onChange={(event) => onChange({ firstDay: event.target.value })} /></Field>
          <Field id="lastDay" label="Last day"><Input id="lastDay" type="date" value={form.lastDay} onChange={(event) => onChange({ lastDay: event.target.value })} /></Field>
        </div>
        <Field id="city" label="City" hint="Shown on the post as the venue."><Input id="city" maxLength={LIMITS.entryCity} value={form.city} onChange={(event) => onChange({ city: event.target.value })} placeholder="Dubai" /></Field>
        <Field id="stand" label="Hall / stand (optional)" hint="Left out of the post if empty. Never guessed."><Input id="stand" maxLength={LIMITS.entryStand} value={form.stand} onChange={(event) => onChange({ stand: event.target.value })} placeholder="Hall 3 · Stand B12" /></Field>
        <EntryImageField kind="event_logo" image={form.image} onChange={(image) => onChange({ image })} />
      </>
    );
  }
  if (form.kind === "informative") {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <Field id="slideCount" label="Slides">
            <select id="slideCount" className={SELECT_CLASSES} value={form.slideCount} onChange={(event) => onChange({ slideCount: event.target.value })}>
              {Array.from({ length: LIMITS.carouselSlides.max - LIMITS.carouselSlides.min + 1 }, (_, offset) => LIMITS.carouselSlides.min + offset).map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </Field>
          <Field id="fruit" label="Fruit (optional)">
            <select id="fruit" className={SELECT_CLASSES} value={form.fruit} onChange={(event) => onChange({ fruit: event.target.value })}>
              <option value="">Let the writer choose</option>
              {FRUITS.map((fruit) => <option key={fruit} value={fruit}>{fruit}</option>)}
            </select>
          </Field>
        </div>
        <Field id="points" label="Points to cover (optional, one per line)" hint={`Up to ${LIMITS.entryPoints.max} points.`}>
          <Textarea id="points" rows={4} value={form.points} onChange={(event) => onChange({ points: event.target.value })} />
        </Field>
      </>
    );
  }
  if (form.kind === "bts") return <EntryImageField kind="photo" image={form.image} onChange={(image) => onChange({ image })} />;
  return null;
}

// The fields every kind has: title, date, notes, format, time and platforms.
export function CommonFields({ form, onChange }: Props) {
  const canBeSquare = form.kind === "festival" || form.kind === "day_of";
  return (
    <>
      <Field id="title" label={form.kind === "informative" ? "Topic" : "Name"}>
        <Input id="title" maxLength={LIMITS.entryTitle} value={form.title} onChange={(event) => onChange({ title: event.target.value })} placeholder={form.kind === "exhibition" ? "World Fresh Produce Expo" : form.kind === "informative" ? "Why Bhagwa pomegranates travel well" : "Dussehra"} />
      </Field>
      <Field id="date" label="Post date"><Input id="date" type="date" value={form.date} onChange={(event) => onChange({ date: event.target.value })} /></Field>
      <Field id="notes" label="Notes for the writer (optional)" hint="Anything the post must say or avoid.">
        <Textarea id="notes" rows={3} maxLength={LIMITS.entryNotes} value={form.notes} onChange={(event) => onChange({ notes: event.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="aspect" label="Format">
          <select id="aspect" className={SELECT_CLASSES} value={form.aspect} onChange={(event) => onChange({ aspect: event.target.value })}>
            <option value="4:5">Portrait 4:5</option>
            {canBeSquare && <option value="1:1">Square 1:1</option>}
          </select>
        </Field>
        <Field id="time" label="Time (optional)" hint="Blank = 10:00 IST."><Input id="time" type="time" value={form.time} onChange={(event) => onChange({ time: event.target.value })} /></Field>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Platforms</legend>
        <div className="flex items-center gap-2"><Checkbox id="instagram" checked={form.instagram} onCheckedChange={(checked) => onChange({ instagram: checked === true })} /><Label htmlFor="instagram">Instagram</Label></div>
        <div className="flex items-center gap-2"><Checkbox id="linkedin" checked={form.linkedin} onCheckedChange={(checked) => onChange({ linkedin: checked === true })} /><Label htmlFor="linkedin">LinkedIn</Label></div>
      </fieldset>
    </>
  );
}
