"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KIND_OPTIONS = [
  { value: "photo", label: "Photo" },
  { value: "event_logo", label: "Event logo" },
  { value: "cutout", label: "Cut-out (no background)" },
  { value: "illustration", label: "Illustration" },
];

// Upload one or many images with a kind, tags, and the "people OK to post" flag.
export function LibraryUploadForm() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsUploading(true);
    try {
      const response = await fetch("/api/library", { method: "POST", body: new FormData(form) });
      const data = await response.json().catch(() => ({ error: "Something went wrong." }));
      if (data.created?.length) toast.success(`Added ${data.created.length} image${data.created.length === 1 ? "" : "s"}.`);
      for (const message of data.errors ?? []) toast.error(message);
      if (!response.ok && !data.errors) toast.error(data.error);
      if (data.created?.length) { form.reset(); router.refresh(); }
    } catch {
      // fetch itself failed: the network dropped or the server is down.
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={upload} className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="files">Images</Label>
        <Input id="files" name="files" type="file" multiple required accept="image/jpeg,image/png,image/webp" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kind">Kind</Label>
        <select id="kind" name="kind" defaultValue="photo" className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
          {KIND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" name="tags" placeholder="pomegranate, orchard" />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox id="people_ok" name="people_ok" />
        <Label htmlFor="people_ok">People in these photos are OK to post</Label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isUploading}><Upload aria-hidden="true" /> {isUploading ? "Uploading…" : "Add to library"}</Button>
      </div>
    </form>
  );
}
