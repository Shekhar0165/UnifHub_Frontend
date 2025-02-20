import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value; // Get token from cookies


  // If user is logged in and visits "/", redirect to "/events"
  if (pathname === "/" && accessToken) {
    return NextResponse.redirect(new URL("/events", req.url));
  }

  // If user is NOT logged in and tries to access protected routes, redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next(); // Allow request to proceed if authenticated or on a public page
}

// Apply middleware to only specific protected routes
export const config = {
  matcher: ["/events/:path*", "/user/:path*"], // Protect only these paths
};
