import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { months } from "@/db/schema";
import { planMonth } from "@/lib/ai/planMonth";
import { downloadObject } from "@/lib/r2";
import { calendarKeyFor } from "./monthStatus";
import { savePlan } from "./savePlan";

// Writes the month's status and a short message (the error text, when something failed).
async function setStatus(monthId: string, status: string, statusMessage: string | null): Promise<void> {
  await db.update(months).set({ status, statusMessage, statusUpdatedAt: new Date() }).where(eq(months.id, monthId));
}

// Background job: read the stored calendar, ask Claude for the plan, save it.
// Never throws: any failure is stored on the month so the page can show it instead of a silent spinner.
export async function runPlanJob(monthId: string): Promise<void> {
  try {
    await setStatus(monthId, "planning", null);
    const [month] = await db.select().from(months).where(eq(months.id, monthId));
    if (!month) throw new Error("this month no longer exists");

    const pdf = await downloadObject(calendarKeyFor(monthId));
    const plan = await planMonth(pdf, month.month, { monthId });
    if (plan.month !== month.month) {
      throw new Error(`the calendar looks like ${plan.month}, but you chose ${month.month}. Check the PDF or the month.`);
    }
    await savePlan(monthId, plan);
    await setStatus(monthId, "planned", null);
  } catch (error) {
    // Typical causes: storage or Claude unreachable, a PDF Claude cannot read, or a plan that breaks the content limits.
    console.error(`Plan job failed for month ${monthId}:`, error);
    try {
      await setStatus(monthId, "failed", (error as Error).message);
    } catch (statusError) {
      // If even this write fails (database down) there is nothing more we can do but log it.
      console.error(`Could not record the failure for month ${monthId}:`, statusError);
    }
  }
}
