"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-reads the page data every few seconds while something is running in the background (planning, rendering…).
export function AutoRefresh({ active, everyMs = 3000 }: { active: boolean; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(timer); // stop polling when the page closes or the job finishes
  }, [active, everyMs, router]);
  return null;
}
