import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("sb-access-token")?.value;

  const pathname = request.nextUrl.pathname;

  // Protect: /turf/[id]/book
  const isProtectedRoute = pathname.includes("/book");

  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/turf/:path*/book"],
};