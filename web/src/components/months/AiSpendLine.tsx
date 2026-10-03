import { formatRupees } from "@/components/calendar/formatMoney";
import { spentThisMonth } from "@/lib/budget";

// "AI spend this month: ₹8.4 of ₹1,500 (Claude ₹8.4 · artwork ₹0)". Shows nothing if the numbers cannot be read.
export async function AiSpendLine() {
  let spend: Awaited<ReturnType<typeof spentThisMonth>>;
  try {
    spend = await spentThisMonth();
  } catch (error) {
    // Spend is a nice-to-have on this page; never let a database hiccup break it.
    console.error("Could not read AI spend:", error);
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      AI spend this month: <strong className="text-foreground">{formatRupees(spend.totalInr)}</strong> of {formatRupees(spend.capInr)}{" "}
      (Claude {formatRupees(spend.claudeInr)} · artwork {formatRupees(spend.artworkInr)})
    </p>
  );
}
