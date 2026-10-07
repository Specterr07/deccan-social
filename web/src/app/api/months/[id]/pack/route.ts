import { buildPack } from "@/lib/pack/buildPack";

// GET /api/months/[id]/pack — download a zip of the month's approved posts (slides, captions.md, schedule.csv).
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await buildPack(id);
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return new Response(Buffer.from(result.bytes), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${result.fileName}"`, "Cache-Control": "no-store" },
  });
}
