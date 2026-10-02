import { Badge } from "@/components/ui/badge";
import { monthStatusLabel } from "@/lib/months/monthStatus";

// Status as a word (and a tone), never colour alone.
export function MonthStatusBadge({ status }: { status: string }) {
  const variant = status === "failed" ? "destructive" : status === "planned" ? "default" : "secondary";
  return <Badge variant={variant}>{monthStatusLabel(status)}</Badge>;
}
