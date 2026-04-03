import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect booking page
  const isProtectedRoute = pathname.includes("/book");

  if (isProtectedRoute) {
    // Allow request, frontend will handle auth
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/turf/:path*/book"],
};