"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LibraryPickerDialog } from "./LibraryPickerDialog";
import { sendSlideImage } from "./slideImageClient";

export type SlotProps = {
  slideId: string;
  kind: string; // event_logo | specific
  description: string;
  image: { url: string; name: string } | null;
  missingLibraryName?: string | null; // the calendar named a library image that does not exist
};

// One required image: a thumbnail when filled, otherwise a dashed "Upload <description>" box (never filled automatically).
export function RequiredImageSlot({ slideId, kind, description, image, missingLibraryName }: SlotProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const libraryKind = kind === "event_logo" ? "event_logo" : "photo";

  async function send(method: "POST" | "DELETE", body?: FormData) {
    setIsBusy(true);
    const result = await sendSlideImage(slideId, method, body);
    setIsBusy(false);
    if (!result.ok) { toast.error(result.message); return; }
    router.refresh(); // reload the month so the status badge updates
  }

  function upload(file: File | undefined) {
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    void send("POST", body);
  }

  const fileChooser = <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label={`Upload ${description}`} onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ""; }} />;

  if (image) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- R2 image, no Next optimiser */}
        <img src={image.url} alt={description} className="size-16 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{description}</p>
          <p className="truncate text-xs text-muted-foreground">{image.name}</p>
        </div>
        {fileChooser}
        <Button variant="outline" size="sm" disabled={isBusy} onClick={() => fileInput.current?.click()}>Replace</Button>
        <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => send("DELETE")}>Remove</Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border-2 border-dashed p-3">
      <p className="flex items-center gap-2 text-sm font-medium"><ImagePlus aria-hidden="true" className="size-4" /> Upload {description}</p>
      {missingLibraryName && <p className="text-xs text-muted-foreground">The calendar names “{missingLibraryName}”, but that image is not in the library yet.</p>}
      {fileChooser}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={isBusy} onClick={() => fileInput.current?.click()}>{isBusy ? "Saving…" : "Upload"}</Button>
        <LibraryPickerDialog slideId={slideId} kind={libraryKind} onPicked={() => router.refresh()} />
      </div>
    </div>
  );
}
