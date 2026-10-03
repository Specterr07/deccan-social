"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// "Import from PDF": Claude reads a calendar PDF and adds its posts to the grid. Nothing is planned until you press Plan.
export function ImportPdfDialog({ monthId, hasEntries }: { monthId: string; hasEntries: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);

  async function importPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsReading(true);
    try {
      const response = await fetch(`/api/months/${monthId}/import`, { method: "POST", body: new FormData(event.currentTarget) });
      const body = await response.json().catch(() => ({ error: "Something went wrong." }));
      if (!response.ok) { toast.error(body.error); return; }
      toast.success(`Added ${body.added} ${body.added === 1 ? "post" : "posts"} to the calendar. Check them, then press Plan.`);
      for (const problem of body.skipped as string[]) toast.error(`Skipped: ${problem}`);
      setIsOpen(false);
      router.refresh();
    } catch {
      // fetch itself failed: the network dropped or the server is down.
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsReading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button variant="outline"><FileUp aria-hidden="true" /> Import from PDF</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import a calendar PDF</DialogTitle>
          <DialogDescription>
            We read the PDF and add its posts to the calendar for you to check. Nothing is planned yet. It takes under a minute and costs about ₹1.
            {hasEntries && " Posts already on the calendar are kept, so importing the same PDF twice adds the posts twice."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={importPdf} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdf">Calendar PDF</Label>
            <Input id="pdf" name="file" type="file" accept="application/pdf" required />
          </div>
          <Button type="submit" className="w-full" disabled={isReading}>{isReading ? "Reading the PDF…" : "Import posts"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
