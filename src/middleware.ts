// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// import { jwtVerify } from "jose";

// const secret = new TextEncoder().encode(
//   process.env.JWT_SECRET || "supersecretjwtkey"
// );

// // Helper function to get token from request
// function getTokenFromRequest(req: NextRequest): string | null {
//   // First try to get from cookies
//   const cookieToken = req.cookies.get("user-token")?.value;
//   if (cookieToken) {
//     return cookieToken;
//   }

//   // Then try to get from Authorization header
//   const authHeader = req.headers.get("authorization");
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     return authHeader.substring(7);
//   }

//   return null;
// }

// // Helper function to verify JWT token
// async function verifyToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
//   try {
//     const { payload } = await jwtVerify(token, secret);
//     return { valid: true, payload };
//   } catch (error) {
//     console.log("JWT verification error:", error);
//     return { valid: false, error: "Invalid or expired token" };
//   }
// }

// export async function middleware(req: NextRequest) {
//   const token = getTokenFromRequest(req);
//   const pathname = req.nextUrl.pathname;

//   // Define routes
//   const publicRoutes = ["/auth", "/signin", "/signup", "/forgot-password", "/"];
//   const privateRoutes = [
//     "/dashboard",
//     "/profile", 
//     "/settings",
//     "/checkout",
//     "/account",
//     "/my-orders",
//   ];
//   const adminRoutes = ["/dashboard"];

//   // Check if current path is public, private, or admin
//   const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
//   const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));
//   const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

//   // If no token and trying to access private route -> redirect to signin
//   if (!token && isPrivateRoute) {
//     console.log("🔒 [Middleware] No token found, redirecting to signin");
//     return NextResponse.redirect(new URL("/signin", req.url));
//   }

//   // If token exists, verify it
//   if (token) {
//     const verification = await verifyToken(token);
    
//     if (!verification.valid) {
//       console.log("❌ [Middleware] Invalid token, redirecting to signin");
//       // Clear invalid token from cookies
//       const response = NextResponse.redirect(new URL("/signin", req.url));
//       response.cookies.delete("user-token");
//       return response;
//     }

//     const userRole = verification.payload?.role;
//     console.log("✅ [Middleware] Valid token, user role:", userRole);

//     // If user is logged in and tries to access public auth routes -> redirect to account
//     if (isPublicRoute && pathname !== "/") {
//       console.log("🔄 [Middleware] Authenticated user accessing auth route, redirecting to account");
//       return NextResponse.redirect(new URL("/account", req.url));
//     }

//     // If trying to access admin routes but not admin -> redirect to account
//     if (isAdminRoute && userRole !== "admin") {
//       console.log("🚫 [Middleware] Non-admin user trying to access admin route, redirecting to account");
//       return NextResponse.redirect(new URL("/account", req.url));
//     }
//   }

//   // Allow the request to proceed
//   console.log("✅ [Middleware] Request allowed for:", pathname);
//   return NextResponse.next();
// }

// // Tell Next.js which paths to match
// export const config = {
//   matcher: [
//     "/auth/:path*",
//     "/signin",
//     "/signup", 
//     "/forgot-password",
//     "/checkout",
//     "/account",
//     "/my-orders",
//     "/dashboard/:path*",
//     "/profile/:path*",
//     "/settings/:path*",
//   ],
// };



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