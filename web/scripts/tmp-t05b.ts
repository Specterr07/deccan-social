import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { assets, months, posts, slides, generations } from "@/db/schema";
import { createMonth } from "@/lib/months/createMonth";
import { saveEntry } from "@/lib/entries/saveEntry";
import { runPlanJob } from "@/lib/months/planJob";

(async () => {
  const created = await createMonth("2099-11");
  if (!created.ok) throw new Error(created.message);
  const monthId = created.monthId;
  const [logo] = await db.select().from(assets).where(eq(assets.kind, "event_logo")).limit(1);
  const [anyAsset] = logo ? [logo] : await db.select().from(assets).limit(1);
  const entries = [
    { kind: "festival", date: "2099-11-08", title: "Diwali", aspect: "1:1" },
    { kind: "day_of", date: "2099-11-12", title: "World Mango Day" },
    { kind: "exhibition", date: "2099-11-14", title: "World Fresh Produce Expo", details: { firstDay: "2099-11-20", lastDay: "2099-11-22", city: "Dubai", stand: "Hall 3 · Stand B12" }, requiredImageAssetId: anyAsset.id },
    { kind: "informative", date: "2099-11-18", title: "Why pomegranates travel well", details: { fruit: "pomegranate", slideCount: 4 } },
    { kind: "bts", date: "2099-11-25", title: "Packhouse team grading grapes" },
  ];
  for (const entry of entries) { const r = await saveEntry(monthId, entry); if (!r.ok) throw new Error(r.message); }
  const started = Date.now();
  await runPlanJob(monthId);
  console.log("job seconds:", Math.round((Date.now() - started) / 1000));
  const [month] = await db.select().from(months).where(eq(months.id, monthId));
  console.log("MONTH", monthId, month.status, JSON.stringify(month.statusMessage));
  const rows = await db.query.posts.findMany({ where: eq(posts.monthId, monthId), with: { slides: { orderBy: (t, { asc }) => [asc(t.idx)] } }, orderBy: (t, { asc }) => [asc(t.date)] });
  for (const p of rows) console.log(p.date, p.kind, p.status, p.slides.map((s) => (s.renderUrl ? "R" : "-") + (s.assetId ? "p" : "_")).join(" "));
  const gens = await db.select().from(generations);
  console.log("generations total:", gens.length, "cost $" + gens.reduce((sum, g) => sum + Number(g.costUsd), 0).toFixed(4));
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
