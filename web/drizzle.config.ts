import { defineConfig } from "drizzle-kit";

// `pnpm db:generate` writes SQL migrations to web/drizzle/ from src/db/schema.ts (commit them).
// `pnpm db:migrate` applies them. We no longer use `drizzle-kit push` against Neon (see docs/CICD.md).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
