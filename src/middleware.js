import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  // Allow free access to home page
  if (pathname === "/" ) {
    return NextResponse.next();
  }

  // For protected routes (/events, /user, etc), check for token
  if (!accessToken) {
    // No token found - redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // User has token, allow them to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/events/:path*", "/user/:path*"],
};