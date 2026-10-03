import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthStatusBadge } from "@/components/months/MonthStatusBadge";
import { NewMonthDialog } from "@/components/months/NewMonthDialog";
import { formatMonthLabel } from "@/lib/months/monthStatus";
import { listMonths } from "@/lib/months/queries";

export const dynamic = "force-dynamic"; // always read the latest months, never a cached copy

export default async function MonthsPage() {
  let monthList: Awaited<ReturnType<typeof listMonths>> = [];
  let loadError: string | null = null;
  try {
    monthList = await listMonths();
  } catch (error) {
    // The database is unreachable; show a message instead of a crashed page.
    console.error("Could not load months:", error);
    loadError = "We could not load your months. Please refresh in a moment.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl">Months</h1>
        <NewMonthDialog />
      </div>

      {loadError && <p role="alert" className="text-destructive">{loadError}</p>}
      {!loadError && monthList.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No months yet</CardTitle>
            <CardDescription>Start a month, add its posts on the calendar, and we will plan them for review.</CardDescription>
          </CardHeader>
        </Card>
      )}
      <div className="grid gap-3">
        {monthList.map((month) => (
          <Link key={month.id} href={`/months/${month.id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center justify-between gap-4">
                <span className="text-lg font-medium">{formatMonthLabel(month.month)}</span>
                <MonthStatusBadge status={month.status} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
