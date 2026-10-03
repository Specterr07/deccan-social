import { notFound } from "next/navigation";
import { CalendarBuilder } from "@/components/calendar/CalendarBuilder";
import { AiSpendLine } from "@/components/months/AiSpendLine";
import { AutoRefresh } from "@/components/months/AutoRefresh";
import { MonthStatusBadge } from "@/components/months/MonthStatusBadge";
import { PlanAgainButton } from "@/components/months/PlanAgainButton";
import { PlannedPostsTable } from "@/components/months/PlannedPostsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { spentThisMonth } from "@/lib/budget";
import { listEntries } from "@/lib/entries/queries";
import { toEntryView } from "@/lib/entries/entryView";
import { formatMonthLabel } from "@/lib/months/monthStatus";
import { getMonthWithPosts } from "@/lib/months/queries";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MonthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound(); // a mistyped address, not a database error

  const month = await getMonthWithPosts(id);
  if (!month) notFound();

  const entries = (await listEntries(id)).map(toEntryView);
  const spend = await spentThisMonth()
    .then((amounts) => ({ totalInr: amounts.totalInr, capInr: amounts.capInr, usdInrRate: env.USD_INR_RATE }))
    .catch((error) => { console.error("Could not read AI spend:", error); return null; }); // the planner works without the spend figure

  const isPlanning = month.status === "planning";
  const calendar = <CalendarBuilder monthId={month.id} month={month.month} entries={entries} canEdit={!isPlanning} hasPosts={month.posts.length > 0} spend={spend} />;
  return (
    <div className="space-y-6">
      <AutoRefresh active={isPlanning} />
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{formatMonthLabel(month.month)}</h1>
        <MonthStatusBadge status={month.status} />
      </div>
      <AiSpendLine />

      {isPlanning && (
        <Card>
          <CardHeader>
            <CardTitle>Planning your posts…</CardTitle>
            <CardDescription>We are reading the calendar and writing each post. This page updates by itself; it usually takes a minute or two.</CardDescription>
          </CardHeader>
        </Card>
      )}
      {month.status === "failed" && (
        <Card>
          <CardHeader>
            <CardTitle>The plan could not be made</CardTitle>
            <CardDescription>Nothing was saved. Here is what went wrong:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre role="alert" className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{month.statusMessage ?? "Unknown error."}</pre>
            <PlanAgainButton monthId={month.id} />
          </CardContent>
        </Card>
      )}
      {month.posts.length === 0 ? calendar : (
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="posts"><PlannedPostsTable posts={month.posts} /></TabsContent>
          <TabsContent value="calendar">{calendar}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
