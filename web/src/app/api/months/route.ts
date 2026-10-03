import { createMonth } from "@/lib/months/createMonth";

// POST /api/months — start a new month (JSON body: { month: "YYYY-MM" }). The calendar is built in the app afterwards.
export async function POST(request: Request) {
  let body: { month?: unknown };
  try {
    body = await request.json();
  } catch {
    // The body was not JSON (or was cut off).
    return Response.json({ error: "The request did not arrive properly. Please try again." }, { status: 400 });
  }

  const result = await createMonth(String(body.month ?? ""));
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });
  return Response.json({ monthId: result.monthId }, { status: 201 });
}
