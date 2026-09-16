import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "tontine_session";
/** "/" is the general login (all roles but Développeur); "/mode-developer" is the developer login. */
const PUBLIC_PATHS = ["/", "/mode-developer"];

/**
 * Optimistic auth check only (reads the session cookie, does not call the API).
 * Next.js 16 renamed Middleware to Proxy; behavior is unchanged. Real
 * authorization still happens in the DAL (src/lib/auth.ts) and, ultimately,
 * in the Laravel API itself.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // "assets" is excluded too: public branding files (e.g. the login page's logo)
  // must load before a session cookie exists, since the login page itself is
  // one of the PUBLIC_PATHS an unauthenticated visitor is on.
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
