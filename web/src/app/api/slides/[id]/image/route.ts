import { clearRequiredImage, fillWithAsset, fillWithUpload } from "@/lib/library/fillRequiredImage";

// POST /api/slides/[id]/image — fill a slide's required image. Form fields: `file` (new upload) OR `assetId` (library pick).
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "The upload did not arrive properly. Please try again." }, { status: 400 });
  }

  const file = formData.get("file");
  const assetId = formData.get("assetId");
  try {
    if (file instanceof File && file.size > 0) {
      const result = await fillWithUpload(id, file);
      return Response.json(result.ok ? result : { error: result.message }, { status: result.ok ? 200 : result.status });
    }
    if (typeof assetId === "string" && assetId) {
      const result = await fillWithAsset(id, assetId);
      return Response.json(result.ok ? result : { error: result.message }, { status: result.ok ? 200 : result.status });
    }
    return Response.json({ error: "Choose an image to upload or pick one from the library." }, { status: 400 });
  } catch (error) {
    // A malformed id (not a UUID) or a database outage.
    console.error(`Filling the image of slide ${id} failed:`, error);
    return Response.json({ error: "We could not save that image. Please try again." }, { status: 500 });
  }
}

// DELETE /api/slides/[id]/image — empty the slot again (the library image is kept).
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await clearRequiredImage(id);
    return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
  } catch (error) {
    console.error(`Clearing the image of slide ${id} failed:`, error);
    return Response.json({ error: "We could not remove that image. Please try again." }, { status: 500 });
  }
}
