"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LibraryPickerDialog } from "@/components/months/LibraryPickerDialog";
import { uploadLibraryImage } from "./entryClient";

type Image = { id: string; url: string; name: string };

// The event logo (exhibition) or the behind-the-scenes photo: upload a new one or pick one from the library.
// Optional here; a post without it waits as "Needs image" after planning.
export function EntryImageField({ kind, image, onChange }: { kind: "event_logo" | "photo"; image: Image | null; onChange: (image: Image | null) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const label = kind === "event_logo" ? "Event logo" : "Photo";

  async function upload(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    const result = await uploadLibraryImage(file, kind);
    setIsUploading(false);
    if (!result.ok) { toast.error(result.message); return; }
    onChange(result.image);
  }

  const fileChooser = <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label={`Upload ${label.toLowerCase()}`} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />;

  if (image) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- R2 image, no Next optimiser */}
        <img src={image.url} alt={label} className="size-14 rounded object-cover" />
        <p className="min-w-0 flex-1 truncate text-sm">{image.name}</p>
        {fileChooser}
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Remove</Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border-2 border-dashed p-3">
      <p className="flex items-center gap-2 text-sm font-medium"><ImagePlus aria-hidden="true" className="size-4" /> {label} (you can add it later)</p>
      {fileChooser}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={isUploading} onClick={() => fileInput.current?.click()}>{isUploading ? "Saving…" : "Upload"}</Button>
        <LibraryPickerDialog kind={kind} onSelect={async (item) => { onChange({ id: item.id, url: item.url, name: item.name }); return true; }} />
      </div>
    </div>
  );
}
