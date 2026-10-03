import { approvePost, undoApproval } from "@/lib/posts/approvePost";

// POST /api/posts/[id]/approve — approve a drawn post (409 while it needs an image).
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await approvePost(id);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}

// DELETE /api/posts/[id]/approve — take the approval back.
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await undoApproval(id);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
