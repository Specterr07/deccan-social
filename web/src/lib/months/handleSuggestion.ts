import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { months } from "@/db/schema";
import { saveEntry } from "@/lib/entries/saveEntry";
import { findSuggestion } from "./suggestions";

const requestSchema = z.object({ action: z.enum(["add", "dismiss"]), date: z.string(), title: z.string() });

export type SuggestionResult = { ok: true } | { ok: false; status: number; message: string };

// "Add" turns a suggested day into a calendar entry; "Dismiss" hides it for this month.
// The browser only names the suggestion; its kind and date are read from the data file, never from the request.
export async function handleSuggestion(monthId: string, body: unknown): Promise<SuggestionResult> {
  const request = requestSchema.safeParse(body);
  if (!request.success) return { ok: false, status: 400, message: "That request was not understood." };

  try {
    const [month] = await db.select().from(months).where(eq(months.id, monthId));
    if (!month) return { ok: false, status: 404, message: "That month does not exist." };
    const suggestion = findSuggestion(month.month, request.data.date, request.data.title);
    if (!suggestion) return { ok: false, status: 404, message: "That suggestion is not on the list for this month." };

    if (request.data.action === "dismiss") {
      await db.update(months).set({ dismissedSuggestions: sql`array_append(${months.dismissedSuggestions}, ${suggestion.title})` }).where(eq(months.id, monthId));
      return { ok: true };
    }
    const saved = await saveEntry(monthId, { kind: suggestion.kind, date: suggestion.date, title: suggestion.title, notes: suggestion.note }, undefined, "suggested");
    return saved.ok ? { ok: true } : saved;
  } catch (error) {
    // Database trouble.
    console.error(`Handling a suggestion for ${monthId} failed:`, error);
    return { ok: false, status: 500, message: "We could not save that. Please try again." };
  }
}
