import { after } from "next/server";
import { createMonth } from "@/lib/months/createMonth";
import { runPlanJob } from "@/lib/months/planJob";

// POST /api/months — upload a calendar PDF (form fields: month "YYYY-MM", file) and start planning in the background.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    // The body was not a form upload (or was cut off).
    return Response.json({ error: "The upload did not arrive properly. Please try again." }, { status: 400 });
  }

  const file = formData.get("file");
  const result = await createMonth(String(formData.get("month") ?? ""), file instanceof File ? file : null);
  if (!result.ok) return Response.json({ error: result.message }, { status: result.status });

  after(() => runPlanJob(result.monthId)); // runs once the response has been sent
  return Response.json({ monthId: result.monthId }, { status: 201 });
}
