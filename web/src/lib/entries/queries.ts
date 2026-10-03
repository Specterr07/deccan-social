import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { calendarEntries } from "@/db/schema";

// All entries of a month in date order, each with its linked image (event logo / photo) if there is one.
export async function listEntries(monthId: string) {
  return db.query.calendarEntries.findMany({
    where: eq(calendarEntries.monthId, monthId),
    orderBy: [asc(calendarEntries.date), asc(calendarEntries.createdAt)],
    with: { requiredImage: true },
  });
}

export type EntryWithImage = Awaited<ReturnType<typeof listEntries>>[number];
