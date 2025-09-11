import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretjwtkey"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("user-token")?.value;

  // Define routes
  const publicRoutes = ["/auth", "/signin", "/signup", "/forgot-password"];
  const privateRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/checkout",
    "/account",
  ];

  const pathname = req.nextUrl.pathname;

  // If user is logged in and tries to access public route -> redirect to dashboard
  if (token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  // If user is NOT logged in and tries to access private route -> redirect to login
  if (!token && privateRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (pathname.startsWith("/dashboard")) {
    try {
      const { payload } = await jwtVerify(token as string, secret);

      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/account", req.url));
      }
      return NextResponse.next();
    } catch (err) {
      console.log("err", err);
      // Invalid or expired token
      // return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  // Default allow
  return NextResponse.next();
}

// Tell Next.js which paths to match
export const config = {
  matcher: [
    "/auth/:path*",
    "/signin",
    "/signup",
    "/checkout",
    "/forgot-password",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/account",
  ],
};
