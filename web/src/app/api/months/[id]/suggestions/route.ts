import { handleSuggestion } from "@/lib/months/handleSuggestion";

// POST /api/months/[id]/suggestions — body { action: "add" | "dismiss", date, title } for one suggested day.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null); // not JSON → rejected by the request check
  const result = await handleSuggestion(id, body);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
