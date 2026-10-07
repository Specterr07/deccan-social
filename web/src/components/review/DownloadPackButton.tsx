import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Downloads the zip of approved posts. Disabled (with the reason in words) until at least one post is approved.
export function DownloadPackButton({ monthId, approvedCount }: { monthId: string; approvedCount: number }) {
  if (approvedCount === 0) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="outline" disabled><Download aria-hidden="true" /> Download pack</Button>
        <p className="text-xs text-muted-foreground">Approve a post to download it.</p>
      </div>
    );
  }
  return <Button variant="outline" asChild><a href={`/api/months/${monthId}/pack`}><Download aria-hidden="true" /> Download pack ({approvedCount} approved)</a></Button>;
}
