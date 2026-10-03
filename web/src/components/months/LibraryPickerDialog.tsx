"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type LibraryItem = { id: string; name: string; url: string; tags: string[] };

// "Pick from library": a searchable grid of existing images; `onSelect` receives the exact image the person chose.
// It returns true when the choice was accepted (the dialog then closes).
export function LibraryPickerDialog({ kind, onSelect }: { kind: string; onSelect: (item: LibraryItem) => Promise<boolean> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ kind, q: search });
    fetch(`/api/library?${query}`, { signal: controller.signal })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error);
        setItems(data.items);
        setLoadError(null);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError("We could not load the library. Please try again."); // aborted = typed again, not a failure
      });
    return () => controller.abort(); // a newer search replaces the old request
  }, [isOpen, kind, search]);

  async function pick(item: LibraryItem) {
    if (await onSelect(item)) setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Pick from library</Button></DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick from the library</DialogTitle>
          <DialogDescription>Choose the exact image for this slot.</DialogDescription>
        </DialogHeader>
        <Input placeholder="Search by name…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search the library" />
        {loadError && <p role="alert" className="text-sm text-destructive">{loadError}</p>}
        {!loadError && items.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet. Upload an image instead, or add it on the Library page.</p>}
        <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => pick(item)} className="space-y-1 rounded-lg border p-2 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
              {/* eslint-disable-next-line @next/next/no-img-element -- R2 images, no Next optimiser */}
              <img src={item.url} alt={item.name} className="aspect-square w-full rounded object-cover" />
              <span className="block truncate text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
