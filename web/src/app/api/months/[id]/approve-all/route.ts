import { approveAll } from "@/lib/posts/approveAll";

// POST /api/months/[id]/approve-all — approve every post that is ready; posts waiting for an image are skipped.
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await approveAll(id);
  return Response.json(result.ok ? { approved: result.approved, skippedNeedImage: result.skippedNeedImage } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
