import { swapPicture } from "@/lib/artwork/slidePicture";

// POST /api/slides/[id]/picture — body { assetId }: choose one of this slide's artwork variants. Redraws only its post.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null); // not JSON → rejected below
  if (typeof body?.assetId !== "string") return Response.json({ error: "Choose a picture." }, { status: 400 });
  const result = await swapPicture(id, body.assetId);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
