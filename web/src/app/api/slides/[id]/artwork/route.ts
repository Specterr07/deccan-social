import { regenerateArtwork } from "@/lib/artwork/slidePicture";

// POST /api/slides/[id]/artwork — make one more artwork picture for this slide (paid, budget-checked) and use it.
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await regenerateArtwork(id);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
