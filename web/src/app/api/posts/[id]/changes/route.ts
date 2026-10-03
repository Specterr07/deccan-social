import { requestChanges } from "@/lib/posts/requestChanges";

// POST /api/posts/[id]/changes — body { note }. Claude rewrites only this post following the note; only this post is drawn again.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null); // not JSON → rejected below with a readable message
  const result = await requestChanges(id, body?.note);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
