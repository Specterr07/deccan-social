import { deleteAsset } from "@/lib/library/queries";

// DELETE /api/library/[id] — remove an image from the library (slides that used it become empty again).
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await deleteAsset(id);
    if (!result.found) return Response.json({ error: "That image does not exist." }, { status: 404 });
    return Response.json({ ok: true, slidesAffected: result.slidesAffected });
  } catch (error) {
    // Malformed id or database trouble.
    console.error(`Could not delete library image ${id}:`, error);
    return Response.json({ error: "We could not delete that image. Please try again." }, { status: 500 });
  }
}
