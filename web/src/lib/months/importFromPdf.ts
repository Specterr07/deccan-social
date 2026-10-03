import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { months } from "@/db/schema";
import { readCalendarPdf } from "@/lib/ai/importCalendar";
import { estimatePlanCostUsd } from "@/lib/ai/planCost";
import { canSpend } from "@/lib/budget";
import { saveEntry } from "@/lib/entries/saveEntry";
import { findAssetByName } from "@/lib/library/queries";
import { formatMonthLabel } from "./monthStatus";
import type { ImportRow } from "@/schemas/importRows";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export type ImportResult =
  | { ok: true; added: number; skipped: string[] }
  | { ok: false; status: number; message: string };

// A row's "Image" cell: an exact library name links that image; "will upload" or empty links nothing (never guessed, ADR-014).
async function imageIdFor(row: ImportRow): Promise<string | null> {
  const name = row.image?.trim();
  if (!name || /will upload/i.test(name) || (row.type !== "exhibition" && row.type !== "bts")) return null;
  return (await findAssetByName(name))?.id ?? null;
}

// Turns one imported row into the entry the Add post panel would have saved.
async function rowToEntryInput(row: ImportRow) {
  const common = {
    kind: row.type, date: row.date, title: row.title, notes: row.notes, aspect: row.aspect ?? "4:5", time: row.time,
    requiredImageAssetId: await imageIdFor(row),
  };
  if (row.type === "exhibition") {
    return { ...common, details: { firstDay: row.exhibition_first_day, lastDay: row.exhibition_last_day, city: row.city, stand: row.stand } };
  }
  if (row.type === "informative") {
    return { ...common, details: { fruit: row.fruit, points: row.points, slideCount: row.slide_count ?? 4 } };
  }
  return common;
}

// Checks the PDF, has Claude copy its rows, and adds them to the month's calendar as entries (source "pdf_import").
// Nothing is planned here: the person reviews the grid first. Rows that break the entry rules are skipped and listed.
export async function importFromPdf(monthId: string, file: File | null): Promise<ImportResult> {
  if (!file || file.size === 0) return { ok: false, status: 400, message: "Please choose the calendar PDF." };
  if (file.size > MAX_PDF_BYTES) return { ok: false, status: 400, message: "That PDF is over 10 MB. Please upload a smaller file." };

  try {
    const [month] = await db.select().from(months).where(eq(months.id, monthId));
    if (!month) return { ok: false, status: 404, message: "That month does not exist." };
    if (month.status === "planning") return { ok: false, status: 409, message: "The month is being planned. Wait until it finishes." };

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 4).toString() !== "%PDF") return { ok: false, status: 400, message: "That file is not a PDF." }; // a real PDF starts with "%PDF"
    if (!(await canSpend(estimatePlanCostUsd(31)))) return { ok: false, status: 402, message: "This month's AI budget is used up, so the PDF cannot be read now." };

    const rows = await readCalendarPdf(bytes, month.month, monthId);
    let added = 0;
    const skipped: string[] = [];
    for (const row of rows) {
      const saved = await saveEntry(monthId, await rowToEntryInput(row), undefined, "pdf_import");
      if (saved.ok) added += 1;
      else skipped.push(`${row.title} (${row.date}): ${saved.message}`);
    }
    if (rows.length === 0) return { ok: false, status: 422, message: `No posts for ${formatMonthLabel(month.month)} were found in that PDF.` };
    return { ok: true, added, skipped };
  } catch (error) {
    // Claude or the database was unreachable, or the answer was unusable.
    console.error(`Importing a PDF into ${monthId} failed:`, error);
    return { ok: false, status: 500, message: error instanceof Error ? error.message : "We could not read that PDF. Please try again." };
  }
}
