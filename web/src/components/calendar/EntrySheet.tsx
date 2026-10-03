"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { CalendarEntryView } from "@/lib/entries/entryView";
import { CommonFields, KindSpecificFields } from "./EntryFields";
import { addEntry, removeEntry, updateEntry } from "./entryClient";
import { emptyForm, formFromEntry, formToPayload, type EntryForm } from "./entryForm";
import { KIND_OPTIONS } from "./kindStyles";

export type SheetTarget = { entry: CalendarEntryView } | { date: string } | null;

type Props = { monthId: string; target: SheetTarget; onClose: () => void; onSaved: () => void };

// Side panel to add or edit one post. It starts fresh (keyed) every time it opens for a different post or day.
export function EntrySheet({ monthId, target, onClose, onSaved }: Props) {
  const panelKey = target ? ("entry" in target ? target.entry.id : target.date) : "closed";
  return (
    <Sheet open={target !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {target && <EntryPanel key={panelKey} monthId={monthId} target={target} onSaved={onSaved} />}
      </SheetContent>
    </Sheet>
  );
}

// The form itself: first the type, then only that type's fields.
function EntryPanel({ monthId, target, onSaved }: { monthId: string; target: NonNullable<SheetTarget>; onSaved: () => void }) {
  const editingId = "entry" in target ? target.entry.id : null;
  const [form, setForm] = useState<EntryForm>(() => ("entry" in target ? formFromEntry(target.entry) : emptyForm(target.date)));
  const [isSaving, setIsSaving] = useState(false);

  function change(changes: Partial<EntryForm>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  async function run(action: () => Promise<{ ok: true } | { ok: false; message: string }>, doneMessage: string) {
    setIsSaving(true);
    const result = await action();
    setIsSaving(false);
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(doneMessage);
    onSaved();
  }

  const save = () => run(() => (editingId ? updateEntry(monthId, editingId, formToPayload(form)) : addEntry(monthId, formToPayload(form))), "Saved.");
  const remove = () => editingId && run(() => removeEntry(monthId, editingId), "Post removed.");

  return (
    <>
      <SheetHeader>
        <SheetTitle>{editingId ? "Edit post" : "Add post"}</SheetTitle>
        <SheetDescription>Facts you type here (dates, city, stand, logo) are copied onto the post exactly as written.</SheetDescription>
      </SheetHeader>
      <div className="space-y-4 px-4">
        <div className="space-y-1.5">
          <Label htmlFor="kind">Type of post</Label>
          <select id="kind" className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={form.kind} onChange={(event) => change({ kind: event.target.value, aspect: "4:5", image: null })}>
            {KIND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <CommonFields form={form} onChange={change} />
        <KindSpecificFields form={form} onChange={change} />
      </div>
      <SheetFooter className="flex-row justify-between gap-2">
        <Button onClick={save} disabled={isSaving}>{isSaving ? "Saving…" : "Save"}</Button>
        {editingId && <Button variant="outline" onClick={remove} disabled={isSaving}>Delete</Button>}
      </SheetFooter>
    </>
  );
}
