import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

/**
 * Runs before every page and API request:
 *  1. Blocks signed-out visitors (pages redirect to /login, APIs get 401).
 *  2. Applies security headers.
 *
 * This is the gate for the whole app. API routes that touch data should still
 * check the session themselves (see getCurrentUser in lib/auth.ts).
 */

const PUBLIC_PAGES = new Set(["/login"]);
const PUBLIC_APIS = new Set(["/api/auth/login", "/api/auth/logout", "/api/health"]);

function applySecurityHeaders(response: NextResponse) {
  const isDev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Signed-in users don't need the login page
  if (session && pathname === "/login") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  const isPublic = isApi ? PUBLIC_APIS.has(pathname) : PUBLIC_PAGES.has(pathname);

  if (!session && !isPublic) {
    if (isApi) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
          { status: 401 }
        )
      );
    }

    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
    const response = NextResponse.redirect(loginUrl);
    // Drop a stale or forged cookie so the browser stops sending it
    if (token) response.cookies.delete(SESSION_COOKIE_NAME);
    return applySecurityHeaders(response);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Everything except Next.js internals and static files served from /public
     * (icons, manifest.json, sw.js, etc.), which must load before sign-in.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|jpeg|webp|json|js|txt|webmanifest)$).*)",
  ],
};
