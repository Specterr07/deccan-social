import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { months } from "@/db/schema";

// All months, newest first, for the Months page.
export async function listMonths() {
  return db.select().from(months).orderBy(desc(months.month));
}

// One month with its posts (by date), each post's slides (in order) and each slide's required image, for the month page.
export async function getMonthWithPosts(monthId: string) {
  const month = await db.query.months.findFirst({
    where: (table, { eq }) => eq(table.id, monthId),
    with: {
      posts: {
        orderBy: (table, { asc }) => [asc(table.date)],
        with: { slides: { orderBy: (table, { asc }) => [asc(table.idx)], with: { requiredImage: true } } },
      },
    },
  });
  return month ?? null;
}
