import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Read the token from HTTP-only cookies (automatically sent by the browser)
  const sessionValue = (await cookies()).get("connect.sid")?.value || "";

  // Root path - redirect based on authentication
  if (path === "/") {
    if (sessionValue) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  // Protected routes
  if (path.startsWith("/dashboard")) {
    // if (!sessionValue) {
    //   return NextResponse.redirect(
    //     new URL("/login?redirect=/dashboard", req.nextUrl),
    //   );
    // }
  }

  // Public routes (e.g., login, signup) - redirect if already logged in
  if ((path === "/login" || path === "/signup") && sessionValue) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Allow request to proceed
  return NextResponse.next();
}