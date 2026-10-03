import { deleteEntry, saveEntry } from "@/lib/entries/saveEntry";

type Context = { params: Promise<{ id: string; entryId: string }> };

// PUT /api/months/[id]/entries/[entryId] — replace one calendar entry with the edited version.
export async function PUT(request: Request, context: Context) {
  const { id, entryId } = await context.params;
  const body = await request.json().catch(() => null); // not JSON → fails the entry check with a readable message
  const result = await saveEntry(id, body, entryId);
  return Response.json(result.ok ? { entryId: result.entryId } : { error: result.message }, { status: result.ok ? 200 : result.status });
}

// DELETE /api/months/[id]/entries/[entryId] — remove one post from the calendar.
export async function DELETE(_request: Request, context: Context) {
  const { entryId } = await context.params;
  const result = await deleteEntry(entryId);
  return Response.json(result.ok ? { ok: true } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
