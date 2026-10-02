import path from "node:path";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { Pool } from "pg";

// ONE-TIME step for a database that was created with `drizzle-kit push` before we used migrations.
// It records migration 0000 (the baseline) as already applied, WITHOUT running it, so `db:migrate`
// only applies what comes after. Nothing is dropped or changed in your tables.
// Safe to re-run: it does nothing if any migration is already recorded.
async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set (check .env.local).");

  const baseline = readMigrationFiles({ migrationsFolder: path.join(process.cwd(), "drizzle") })[0];
  if (!baseline) throw new Error("No migrations found in web/drizzle/. Run `pnpm db:generate` first.");

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    // Refuse to baseline an empty database: there, the migration really must run.
    const tables = await pool.query("select to_regclass('public.months') as months, to_regclass('public.posts') as posts");
    if (!tables.rows[0].months || !tables.rows[0].posts) {
      throw new Error("The tables from the baseline do not exist in this database. Run `pnpm db:migrate` instead.");
    }

    // Same table drizzle's own migrator uses to remember what ran.
    await pool.query('create schema if not exists "drizzle"');
    await pool.query('create table if not exists "drizzle"."__drizzle_migrations" (id serial primary key, hash text not null, created_at bigint)');
    const existing = await pool.query('select count(*)::int as count from "drizzle"."__drizzle_migrations"');
    if (existing.rows[0].count > 0) {
      console.info("Migrations are already recorded; nothing to do.");
      return;
    }
    await pool.query('insert into "drizzle"."__drizzle_migrations" (hash, created_at) values ($1, $2)', [baseline.hash, baseline.folderMillis]);
    console.info("Baseline recorded as applied. Run `pnpm db:migrate` for anything newer.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Baseline failed:", error);
  process.exit(1);
});
