"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Deletes one library image after a confirmation. Slides that used it become empty again.
export function DeleteAssetButton({ assetId, name }: { assetId: string; name: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${name}" from the library? Posts using it will need a new image.`)) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/library/${assetId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({ error: "Something went wrong." }));
      if (!response.ok) { toast.error(data.error); return; }
      toast.success(data.slidesAffected ? `Deleted. ${data.slidesAffected} slide(s) now need an image.` : "Deleted.");
      router.refresh();
    } catch {
      // fetch itself failed: the network dropped or the server is down.
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" aria-label={`Delete ${name}`} disabled={isDeleting} onClick={remove}>
      <Trash2 aria-hidden="true" />
    </Button>
  );
}
