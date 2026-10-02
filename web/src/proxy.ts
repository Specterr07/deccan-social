import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isSessionTokenValid } from "@/lib/session";

// Sends visitors without a valid login cookie to /login. Runs before every page except static files.
export async function proxy(request: NextRequest) {
  const isLoggedIn = await isSessionTokenValid(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/months", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the brand folder (fonts/logos) and the favicon.
  matcher: ["/((?!_next/static|_next/image|brand/|favicon.ico).*)"],
};
