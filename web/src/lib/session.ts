import { env } from "@/env";

export const SESSION_COOKIE_NAME = "deccan_session";
export const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 14; // two weeks

// Turns bytes into a hex string so the signature can live in a cookie.
function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Signs text with SESSION_SECRET using Web Crypto (works in the proxy and in server actions alike).
async function sign(text: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text)));
}

// Builds the cookie value "<expiry>.<signature>"; nobody can forge it without SESSION_SECRET.
export async function createSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS;
  return `${expiresAt}.${await sign(String(expiresAt))}`;
}

// Returns true only if the token has a valid signature and has not expired.
// Never throws: a malformed cookie simply means "not logged in".
export async function isSessionTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAtText, signature] = token.split(".");
  if (!expiresAtText || !signature) return false;
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() / 1000) return false;
  return signature === (await sign(expiresAtText));
}
