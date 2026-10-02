import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db/client";
import { months } from "@/db/schema";
import { STALE_PLANNING_MINUTES } from "@/lib/months/monthStatus";
import { runPlanJob } from "@/lib/months/planJob";

// POST /api/months/[id]/plan — plan this month again from its stored calendar (after a failure or a stuck job).
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const [month] = await db.select().from(months).where(eq(months.id, id));
    if (!month) return Response.json({ error: "That month does not exist." }, { status: 404 });

    const minutesInStatus = (Date.now() - month.statusUpdatedAt.getTime()) / 60000;
    const isStuck = month.status === "planning" && minutesInStatus > STALE_PLANNING_MINUTES;
    if (month.status === "planning" && !isStuck) {
      return Response.json({ error: "This month is already being planned." }, { status: 409 });
    }

    after(() => runPlanJob(id));
    return Response.json({ ok: true }, { status: 202 });
  } catch (error) {
    // Database trouble while looking the month up.
    console.error(`Could not restart planning for ${id}:`, error);
    return Response.json({ error: "We could not restart planning. Please try again." }, { status: 500 });
  }
}
