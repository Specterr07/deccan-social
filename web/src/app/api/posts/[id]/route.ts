import { editPost } from "@/lib/posts/editPost";

// PATCH /api/posts/[id] — save edited words (slide text and captions); only this post is drawn again.
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null); // not JSON → rejected by the edit check with a readable message
  const result = await editPost(id, body);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
