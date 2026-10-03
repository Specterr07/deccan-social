import { importFromPdf } from "@/lib/months/importFromPdf";

// POST /api/months/[id]/import — upload a calendar PDF (form field: file). Adds its posts to the calendar as entries; plans nothing.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    // The body was not a form upload (or was cut off).
    return Response.json({ error: "The upload did not arrive properly. Please try again." }, { status: 400 });
  }
  const file = formData.get("file");
  const result = await importFromPdf(id, file instanceof File ? file : null);
  return Response.json(result.ok ? { added: result.added, skipped: result.skipped } : { error: result.message }, { status: result.ok ? 200 : result.status });
}
