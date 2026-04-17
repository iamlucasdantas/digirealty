import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware — attach a lightweight session/tracking cookie for
 * attribution and A/B tests. Runs before every request that matches `matcher`.
 */
const SESSION_COOKIE = "al_sid";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get(SESSION_COOKIE)) {
    res.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
