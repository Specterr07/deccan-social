// Checks every key in ../.env.local against the real provider. Prints values masked; never logs secrets.
// Run: cd scripts && npm install && npm run check-env
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const results = [];
const ok = (name, msg) => results.push(["✅", name, msg]);
const bad = (name, msg) => results.push(["❌", name, msg]);
const skip = (name, msg) => results.push(["⏳", name, msg]);
const need = (name, ...keys) => {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) { skip(name, `fill in: ${missing.join(", ")}`); return false; }
  return true;
};
const t = (ms) => AbortSignal.timeout(ms);

async function claude() {
  const n = "Claude API";
  if (!need(n, "ANTHROPIC_API_KEY")) return;
  if (!env.ANTHROPIC_API_KEY.startsWith("sk-ant-")) return bad(n, "key should start with sk-ant-");
  const r = await fetch("https://api.anthropic.com/v1/models?limit=100", {
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, signal: t(15000),
  });
  if (r.status === 401) return bad(n, "key rejected (401) — create a new one");
  if (!r.ok) return bad(n, `HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`);
  const ids = (await r.json()).data.map((m) => m.id);
  if (env.CLAUDE_MODEL && !ids.includes(env.CLAUDE_MODEL))
    return bad(n, `key works, but CLAUDE_MODEL "${env.CLAUDE_MODEL}" not available. Some options: ${ids.slice(0, 5).join(", ")}`);
  ok(n, `key works; model ${env.CLAUDE_MODEL} available`);
}

async function higgsfield() {
  const n = "Higgsfield";
  if (!need(n, "HF_CREDENTIALS")) return;
  if (!/^[^:\s]+:[^:\s]+$/.test(env.HF_CREDENTIALS)) return bad(n, "HF_CREDENTIALS must be <key-id>:<key-secret>, no spaces");
  // Auth probe: status of a request id that can't exist. 401/403 = bad key; 404/422 = key accepted. Costs nothing.
  const r = await fetch("https://api.higgsfield.ai/requests/00000000-0000-0000-0000-000000000000/status", {
    headers: { Authorization: `Key ${env.HF_CREDENTIALS}` }, signal: t(15000),
  });
  if (r.status === 401 || r.status === 403) return bad(n, `credentials rejected (${r.status})`);
  ok(n, `credentials accepted (probe HTTP ${r.status}); remember to add credit in the console`);
}

async function neon() {
  const n = "Neon Postgres";
  if (!need(n, "DATABASE_URL")) return;
  if (!/^postgres(ql)?:\/\//.test(env.DATABASE_URL)) return bad(n, "should start with postgresql://");
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(env.DATABASE_URL);
  const [row] = await sql`select version()`;
  ok(n, `connected — ${String(row.version).split(" ").slice(0, 2).join(" ")}`);
}

async function r2() {
  const n = "Cloudflare R2";
  if (!need(n, "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET")) return;
  const { S3Client, PutObjectCommand, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  });
  const Key = "_healthcheck/hello.txt";
  try {
    await s3.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key, Body: "ok", ContentType: "text/plain" }));
    await s3.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key }));
  } catch (e) {
    return bad(n, `${e.name}: ${e.message} — check account id, bucket name and token permission (Object Read & Write)`);
  }
  if (!env.R2_PUBLIC_BASE_URL) return skip(n, "write/read works; fill R2_PUBLIC_BASE_URL (enable public dev URL on the bucket)");
  const pub = await fetch(`${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${Key}`, { signal: t(15000) }).catch((e) => ({ ok: false, status: e.message }));
  if (!pub.ok) return bad(n, `write/read works, but public URL failed (${pub.status}) — is public access on?`);
  ok(n, "write, read and public URL all work");
}

async function resend() {
  const n = "Resend";
  if (!need(n, "RESEND_API_KEY", "EMAIL_FROM", "REVIEWER_EMAIL")) return;
  if (!env.RESEND_API_KEY.startsWith("re_")) return bad(n, "key should start with re_");
  const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` }, signal: t(15000) });
  if (r.status === 401) {
    const body = await r.text();
    if (/restricted/i.test(body)) return ok(n, "sending-only key accepted (fine for the app)");
    return bad(n, "key rejected (401)");
  }
  if (!r.ok) return bad(n, `HTTP ${r.status}`);
  const { data = [] } = await r.json();
  const verified = data.filter((d) => d.status === "verified").map((d) => d.name);
  const fromDomain = (env.EMAIL_FROM.match(/@([^>\s]+)/) || [])[1];
  if (fromDomain === "resend.dev") return ok(n, `key works; testing sender — mail only reaches your Resend signup email (REVIEWER_EMAIL must be that address)`);
  if (!verified.includes(fromDomain)) return bad(n, `key works, but ${fromDomain} isn't a verified domain (verified: ${verified.join(", ") || "none"})`);
  ok(n, `key works; sending from verified ${fromDomain}`);
}

for (const check of [claude, higgsfield, neon, r2, resend]) {
  try { await check(); } catch (e) { bad(check.name, `${e.name}: ${e.message}`); }
}
console.log("\ndeccan-social · .env.local check\n");
for (const [icon, name, msg] of results) console.log(`${icon}  ${name.padEnd(15)} ${msg}`);
const done = results.filter((r) => r[0] === "✅").length;
console.log(`\n${done}/${results.length} ready${done === results.length ? " — T-00 done 🎉" : ""}\n`);
process.exit(done === results.length ? 0 : 1);
