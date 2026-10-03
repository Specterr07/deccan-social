"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approve, undoApproval } from "./reviewClient";

// Approve a post, or take the approval back. Disabled (with the reason written next to it) while the post still needs an image.
export function ApproveButton({ postId, status }: { postId: string; status: string }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: typeof approve) {
    setIsBusy(true);
    const result = await action(postId);
    setIsBusy(false);
    if (!result.ok) { toast.error(result.message); return; }
    router.refresh();
  }

  if (status === "approved") return <Button variant="outline" disabled={isBusy} onClick={() => run(undoApproval)}>Undo approval</Button>;
  const canApprove = status === "rendered";
  return (
    <div className="flex flex-col gap-1">
      <Button disabled={!canApprove || isBusy} onClick={() => run(approve)}><Check aria-hidden="true" /> {isBusy ? "Approving…" : "Approve post"}</Button>
      {status === "needs_image" && <p className="text-xs text-destructive">Add the missing image to approve.</p>}
    </div>
  );
}
