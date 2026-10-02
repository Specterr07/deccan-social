import { defineConfig } from "drizzle-kit";

// Used by `pnpm db:push`. Reads DATABASE_URL straight from the environment (loaded from .env.local by the script).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
