"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Default to next month, since calendars are prepared ahead of time. Returns "YYYY-MM".
function nextMonthValue(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

// Button + dialog that starts an empty month and opens its calendar planner.
export function NewMonthDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    try {
      const month = String(new FormData(event.currentTarget).get("month") ?? "");
      const response = await fetch("/api/months", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month }) });
      const body = await response.json().catch(() => ({ error: "Something went wrong." }));
      if (!response.ok) { toast.error(body.error); return; }
      setIsOpen(false);
      router.push(`/months/${body.monthId}`);
    } catch {
      // fetch itself failed: the network dropped or the server is down.
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button><Plus aria-hidden="true" /> New month</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new month</DialogTitle>
          <DialogDescription>Choose the month, then add its posts one by one on the calendar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" name="month" type="month" defaultValue={nextMonthValue()} required />
          </div>
          <Button type="submit" className="w-full" disabled={isCreating}>{isCreating ? "Creating…" : "Open the calendar"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
