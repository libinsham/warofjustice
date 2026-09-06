import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages — no login required
  if (
    pathname === "/" ||
    pathname.startsWith("/india") ||
    pathname.startsWith("/world") ||
    pathname.startsWith("/politics") ||
    pathname.startsWith("/economy") ||
    pathname.startsWith("/society") ||
    pathname.startsWith("/defence") ||
    pathname.startsWith("/science") ||
    pathname.startsWith("/health") ||
    pathname.startsWith("/opinion") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/entertainment") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // Other pages can continue normally for now
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};