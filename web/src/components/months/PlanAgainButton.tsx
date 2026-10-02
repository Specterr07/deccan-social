"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Restarts planning for a month whose plan failed (or got stuck).
export function PlanAgainButton({ monthId }: { monthId: string }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  async function startAgain() {
    setIsStarting(true);
    try {
      const response = await fetch(`/api/months/${monthId}/plan`, { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Something went wrong." }));
        toast.error(body.error);
        return;
      }
      router.refresh();
    } catch {
      // fetch itself failed: the network dropped or the server is down.
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsStarting(false);
    }
  }

  return <Button onClick={startAgain} disabled={isStarting}>{isStarting ? "Starting…" : "Plan again"}</Button>;
}
