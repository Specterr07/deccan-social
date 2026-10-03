import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { months } from "@/db/schema";
import { formatMonthLabel } from "./monthStatus";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a month, for example 2026-11");

export type CreateMonthResult =
  | { ok: true; monthId: string }
  | { ok: false; status: number; message: string };

// Creates an empty month in "draft" status; the calendar is built on the month page.
// Returns a friendly message instead of throwing so the form can show it.
export async function createMonth(monthText: string): Promise<CreateMonthResult> {
  const monthCheck = monthSchema.safeParse(monthText);
  if (!monthCheck.success) return { ok: false, status: 400, message: monthCheck.error.issues[0].message };

  try {
    const [existing] = await db.select({ id: months.id }).from(months).where(eq(months.month, monthCheck.data));
    if (existing) return { ok: false, status: 409, message: `${formatMonthLabel(monthCheck.data)} already exists. Open it from the list instead.` };

    const [created] = await db.insert(months).values({ month: monthCheck.data, status: "draft" }).returning({ id: months.id });
    return { ok: true, monthId: created.id };
  } catch (error) {
    // Database trouble; the details go to the log, the person gets a plain message.
    console.error("Creating a month failed:", error);
    return { ok: false, status: 500, message: "We could not create the month. Please try again in a minute." };
  }
}
