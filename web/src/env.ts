import { z } from "zod";

// Describes every environment variable the app needs, so a missing or malformed one
// fails at startup with a clear message instead of deep inside a request.
const envSchema = z.object({
  APP_URL: z.string().url(),
  APP_PASSWORD: z.string().min(8, "APP_PASSWORD must be at least 8 characters"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  DATABASE_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL: z.string().min(1),
  CLAUDE_MODEL_LIGHT: z.string().min(1),
  HF_CREDENTIALS: z.string().min(1),
  HIGGSFIELD_MODEL: z.string().min(1),
  HIGGSFIELD_COST_PER_IMAGE_USD: z.coerce.number().positive(),
  IMAGE_VARIANTS_PER_SLIDE: z.coerce.number().int().min(1).max(6),
  MONTHLY_AI_BUDGET_INR: z.coerce.number().positive(),
  USD_INR_RATE: z.coerce.number().positive(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_BASE_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  REVIEWER_EMAIL: z.string().email(),
});

// Parses process.env once; throws a readable list of every problem if anything is wrong.
function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables (check .env.local):\n${problems}`);
  }
  return result.data;
}

type Env = z.infer<typeof envSchema>;

// `next build` imports this file while collecting pages, but real secrets only exist at runtime
// (e.g. as Fly secrets), so skip validation during the build phase. Runtime start-up is still strict.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const env: Env = isBuildPhase ? (process.env as unknown as Env) : parseEnv();
