import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { months } from "@/db/schema";
import { uploadObject } from "@/lib/r2";
import { calendarKeyFor, formatMonthLabel } from "./monthStatus";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a month, for example 2026-11");

export type CreateMonthResult =
  | { ok: true; monthId: string }
  | { ok: false; status: number; message: string };

// Checks the upload, stores the PDF in R2 and creates the month row (status "planning").
// Returns a friendly message instead of throwing so the form can show it.
export async function createMonth(monthText: string, file: File | null): Promise<CreateMonthResult> {
  const monthCheck = monthSchema.safeParse(monthText);
  if (!monthCheck.success) return { ok: false, status: 400, message: monthCheck.error.issues[0].message };
  if (!file || file.size === 0) return { ok: false, status: 400, message: "Please choose the calendar PDF." };
  if (file.size > MAX_PDF_BYTES) return { ok: false, status: 400, message: "That PDF is over 10 MB. Please upload a smaller file." };

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    // A real PDF starts with "%PDF"; this catches renamed images or documents.
    if (bytes.subarray(0, 4).toString() !== "%PDF") return { ok: false, status: 400, message: "That file is not a PDF." };

    const [existing] = await db.select({ id: months.id }).from(months).where(eq(months.month, monthCheck.data));
    if (existing) return { ok: false, status: 409, message: `${formatMonthLabel(monthCheck.data)} already exists. Open it from the list instead.` };

    const [created] = await db.insert(months).values({ month: monthCheck.data, status: "planning" }).returning({ id: months.id });
    const calendarUrl = await uploadObject(calendarKeyFor(created.id), bytes, "application/pdf");
    await db.update(months).set({ calendarUrl }).where(eq(months.id, created.id));
    return { ok: true, monthId: created.id };
  } catch (error) {
    // Storage or database trouble; the details go to the log, the person gets a plain message.
    console.error("Creating a month failed:", error);
    return { ok: false, status: 500, message: "We could not save the calendar. Please try again in a minute." };
  }
}
