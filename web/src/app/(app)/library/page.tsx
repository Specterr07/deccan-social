import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder so the nav link works; the real photo library is built in T-04.
export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Photo library</h1>
      <Card>
        <CardHeader>
          <CardTitle>Nothing here yet</CardTitle>
          <CardDescription>Product photos you upload will be listed here.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
