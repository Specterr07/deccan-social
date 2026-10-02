import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Applies every SQL migration in web/drizzle/ that the database has not seen yet (`pnpm db:migrate`).
// Reads only DATABASE_URL, so it also works in a container that has no other secrets (Fly release_command).
async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set (check .env.local).");

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.info("Migrations are up to date.");
  } finally {
    await pool.end(); // always close the connection so the script can exit
  }
}

main().catch((error) => {
  // A failed migration must stop a deploy, so exit non-zero with the reason.
  console.error("Migration failed:", error);
  process.exit(1);
});
