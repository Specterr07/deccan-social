import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder list of months; the upload button and real list arrive in T-03.
export default function MonthsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Months</h1>
      <Card>
        <CardHeader>
          <CardTitle>No months yet</CardTitle>
          <CardDescription>Upload a monthly calendar and its posts will appear here for review.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Uploading will be added soon.</CardContent>
      </Card>
    </div>
  );
}
