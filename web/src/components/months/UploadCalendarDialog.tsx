"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
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

// Button + dialog that uploads a calendar PDF and opens the new month.
export function UploadCalendarDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);
    try {
      const response = await fetch("/api/months", { method: "POST", body: new FormData(event.currentTarget) });
      const body = await response.json().catch(() => ({ error: "Something went wrong." }));
      if (!response.ok) {
        toast.error(body.error);
        return;
      }
      setIsOpen(false);
      router.push(`/months/${body.monthId}`);
    } catch {
      // fetch itself failed: the network dropped or the server is down.
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Upload aria-hidden="true" /> Upload calendar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a monthly calendar</DialogTitle>
          <DialogDescription>We will read the PDF and plan the month&apos;s posts. This takes about a minute.</DialogDescription>
        </DialogHeader>
        <form onSubmit={upload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" name="month" type="month" defaultValue={nextMonthValue()} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Calendar PDF</Label>
            <Input id="file" name="file" type="file" accept="application/pdf" required />
          </div>
          <Button type="submit" className="w-full" disabled={isUploading}>{isUploading ? "Uploading…" : "Upload and plan"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
