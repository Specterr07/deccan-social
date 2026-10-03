import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { calendarEntries, months } from "@/db/schema";
import { entryInputSchema, firstProblem } from "@/schemas/entries";
import { LIMITS } from "@/schemas/limits";

export type SaveEntryResult = { ok: true; entryId: string } | { ok: false; status: number; message: string };

// Months where the calendar can still change. While a plan job runs the entries must not move under it.
const EDITABLE_STATUSES = ["draft", "planned", "failed"];

// Checks what the panel sent against the entry rules and the month's dates. Returns the clean entry or a readable message.
function checkEntry(body: unknown, month: string) {
  const parsed = entryInputSchema.safeParse(body);
  if (!parsed.success) return { message: firstProblem(parsed.error) };
  const entry = parsed.data;
  if (!entry.date.startsWith(month)) return { message: `The date must be inside the month (${month}).` };
  return { entry };
}

// Creates a new entry in a month, or updates an existing one when `entryId` is given.
export async function saveEntry(monthId: string, body: unknown, entryId?: string): Promise<SaveEntryResult> {
  try {
    const [month] = await db.select().from(months).where(eq(months.id, monthId));
    if (!month) return { ok: false, status: 404, message: "That month does not exist." };
    if (!EDITABLE_STATUSES.includes(month.status)) return { ok: false, status: 409, message: "The month is being planned. Wait until it finishes to change the calendar." };

    const checked = checkEntry(body, month.month);
    if (!checked.entry) return { ok: false, status: 400, message: checked.message! };
    const { entry } = checked;

    const values = {
      date: entry.date, kind: entry.kind, title: entry.title,
      details: "details" in entry ? entry.details : null,
      notes: entry.notes ?? null, aspect: entry.aspect, time: entry.time ?? null, platforms: entry.platforms,
      requiredImageAssetId: entry.requiredImageAssetId ?? null,
      updatedAt: new Date(),
    };

    if (entryId) {
      const [updated] = await db.update(calendarEntries).set(values).where(and(eq(calendarEntries.id, entryId), eq(calendarEntries.monthId, monthId))).returning({ id: calendarEntries.id });
      if (!updated) return { ok: false, status: 404, message: "That post is no longer in the calendar." };
      return { ok: true, entryId: updated.id };
    }

    const existing = await db.select({ id: calendarEntries.id }).from(calendarEntries).where(eq(calendarEntries.monthId, monthId));
    if (existing.length >= LIMITS.postsPerMonth) return { ok: false, status: 400, message: `A month can have at most ${LIMITS.postsPerMonth} posts.` };
    const [created] = await db.insert(calendarEntries).values({ monthId, ...values }).returning({ id: calendarEntries.id });
    return { ok: true, entryId: created.id };
  } catch (error) {
    // Database trouble, or a malformed id in the address.
    console.error("Saving a calendar entry failed:", error);
    return { ok: false, status: 500, message: "We could not save that post. Please try again." };
  }
}

// Removes one entry from the calendar.
export async function deleteEntry(entryId: string): Promise<SaveEntryResult> {
  try {
    const [removed] = await db.delete(calendarEntries).where(eq(calendarEntries.id, entryId)).returning({ id: calendarEntries.id });
    if (!removed) return { ok: false, status: 404, message: "That post is no longer in the calendar." };
    return { ok: true, entryId: removed.id };
  } catch (error) {
    console.error(`Deleting calendar entry ${entryId} failed:`, error);
    return { ok: false, status: 500, message: "We could not delete that post. Please try again." };
  }
}
