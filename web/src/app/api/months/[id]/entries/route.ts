import { listEntries } from "@/lib/entries/queries";
import { saveEntry } from "@/lib/entries/saveEntry";

// GET /api/months/[id]/entries — the month's calendar entries.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    return Response.json({ entries: await listEntries(id) });
  } catch (error) {
    console.error(`Could not load the entries of ${id}:`, error);
    return Response.json({ error: "We could not load the calendar. Please refresh." }, { status: 500 });
  }
}

// POST /api/months/[id]/entries — add a post to the calendar.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null); // not JSON → fails the entry check below with a readable message
  const result = await saveEntry(id, body);
  return Response.json(result.ok ? { entryId: result.entryId } : { error: result.message }, { status: result.ok ? 201 : result.status });
}
