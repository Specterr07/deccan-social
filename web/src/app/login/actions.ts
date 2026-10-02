"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { SESSION_COOKIE_NAME, SESSION_LIFETIME_SECONDS, createSessionToken } from "@/lib/session";

// Compares two strings in constant time so response timing doesn't leak how many characters matched.
function passwordsMatch(given: string, expected: string): boolean {
  const givenBytes = Buffer.from(given);
  const expectedBytes = Buffer.from(expected);
  return givenBytes.length === expectedBytes.length && timingSafeEqual(givenBytes, expectedBytes);
}

// Checks the shared password; on success sets the signed cookie and goes to /months.
// Returns an error message (instead of throwing) so the form can show it.
export async function login(_previousState: string | null, formData: FormData): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password, env.APP_PASSWORD)) {
    return "That password is not right. Please try again.";
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
  });
  redirect("/months");
}

// Clears the login cookie and returns to the login page.
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
