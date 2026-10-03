"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveAllPosts } from "./reviewClient";

// Approves every post that is ready in one go. Posts waiting for an image are skipped and the message says so.
export function ApproveAllButton({ monthId, readyCount }: { monthId: string; readyCount: number }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  async function run() {
    setIsBusy(true);
    const result = await approveAllPosts(monthId);
    setIsBusy(false);
    if (!result.ok) { toast.error(result.message); return; }
    toast.success(`Approved ${result.approved} ${result.approved === 1 ? "post" : "posts"}.${result.skippedNeedImage > 0 ? ` ${result.skippedNeedImage} still need an image.` : ""}`);
    router.refresh();
  }

  return <Button onClick={run} disabled={isBusy || readyCount === 0}><CheckCheck aria-hidden="true" /> {isBusy ? "Approving…" : `Approve all ready (${readyCount})`}</Button>;
}
