import { DeleteAssetButton } from "@/components/library/DeleteAssetButton";
import { LibraryUploadForm } from "@/components/library/LibraryUploadForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listAssets } from "@/lib/library/queries";

export const dynamic = "force-dynamic"; // always show the latest images

const KIND_LABELS: Record<string, string> = { photo: "Photo", event_logo: "Event logo", cutout: "Cut-out", illustration: "Illustration", ai: "AI artwork" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ kind?: string; tag?: string; q?: string }> }) {
  const filter = await searchParams;
  let items: Awaited<ReturnType<typeof listAssets>> = [];
  let loadError: string | null = null;
  try {
    items = await listAssets({ kind: filter.kind || undefined, tag: filter.tag || undefined, search: filter.q || undefined });
  } catch (error) {
    // The database is unreachable; show a message instead of a crashed page.
    console.error("Could not load the library:", error);
    loadError = "We could not load the library. Please refresh in a moment.";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Photo library</h1>
      <LibraryUploadForm />

      <form className="flex flex-wrap items-end gap-3" aria-label="Filter the library">
        <div className="space-y-1">
          <label htmlFor="filter-kind" className="text-sm">Kind</label>
          <select id="filter-kind" name="kind" defaultValue={filter.kind ?? ""} className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="">All</option>
            {Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="filter-tag" className="text-sm">Tag</label>
          <Input id="filter-tag" name="tag" defaultValue={filter.tag ?? ""} placeholder="pomegranate" className="w-40" />
        </div>
        <div className="space-y-1">
          <label htmlFor="filter-q" className="text-sm">Name</label>
          <Input id="filter-q" name="q" defaultValue={filter.q ?? ""} placeholder="packhouse" className="w-40" />
        </div>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {loadError && <p role="alert" className="text-destructive">{loadError}</p>}
      {!loadError && items.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nothing here</CardTitle>
            <CardDescription>Upload images above, or change the filter.</CardDescription>
          </CardHeader>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((asset) => (
          <figure key={asset.id} className="space-y-2 rounded-xl border bg-card p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 images, no Next optimiser */}
            <img src={asset.url} alt={asset.description ?? asset.name} className="aspect-square w-full rounded-lg object-cover" />
            <figcaption className="space-y-1 px-1 pb-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-sm font-medium" title={asset.name}>{asset.name}</span>
                <DeleteAssetButton assetId={asset.id} name={asset.name} />
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{KIND_LABELS[asset.kind] ?? asset.kind}</Badge>
                {asset.peopleOk && <Badge variant="outline">People OK</Badge>}
                {asset.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
