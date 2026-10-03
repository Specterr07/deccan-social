"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestChanges } from "./reviewClient";

const MAX_NOTE_CHARS = 500;

// "Ask for changes": write what should be different; Claude rewrites just this post and it is drawn again.
export function RequestChangesDialog({ postId }: { postId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function send() {
    setIsWorking(true);
    const result = await requestChanges(postId, note);
    setIsWorking(false);
    if (!result.ok) { toast.error(result.message, { duration: 10000 }); return; }
    toast.success("Rewritten and drawn again. Please check it.");
    setIsOpen(false);
    setNote("");
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button variant="outline"><MessageSquareText aria-hidden="true" /> Ask for changes</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask for changes</DialogTitle>
          <DialogDescription>Say what should be different, for example “warmer, and mention our growers”. We rewrite only this post (about ₹1) and it needs a fresh approval.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`note-${postId}`}>What should change?</Label>
          <Textarea id={`note-${postId}`} rows={4} maxLength={MAX_NOTE_CHARS} value={note} onChange={(event) => setNote(event.target.value)} />
          <p className="text-xs text-muted-foreground">{note.length} / {MAX_NOTE_CHARS}</p>
        </div>
        <Button onClick={send} disabled={isWorking || !note.trim()}>{isWorking ? "Rewriting…" : "Rewrite this post"}</Button>
      </DialogContent>
    </Dialog>
  );
}
