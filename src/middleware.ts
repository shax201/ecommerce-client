import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretjwtkey"
);

// Define route permissions mapping
const ROUTE_PERMISSIONS: Record<string, { resource: string; action: string }> = {
  '/admin/orders': { resource: 'orders', action: 'read' },
  '/admin/orders/create': { resource: 'orders', action: 'create' },
  '/admin/orders/edit': { resource: 'orders', action: 'update' },
  '/admin/orders/delete': { resource: 'orders', action: 'delete' },
  
  '/admin/products': { resource: 'products', action: 'read' },
  '/admin/products/create': { resource: 'products', action: 'create' },
  '/admin/products/edit': { resource: 'products', action: 'update' },
  '/admin/products/delete': { resource: 'products', action: 'delete' },
  
  '/admin/categories': { resource: 'categories', action: 'read' },
  '/admin/categories/create': { resource: 'categories', action: 'create' },
  '/admin/categories/edit': { resource: 'categories', action: 'update' },
  '/admin/categories/delete': { resource: 'categories', action: 'delete' },
  
  '/admin/coupons': { resource: 'coupons', action: 'read' },
  '/admin/coupons/create': { resource: 'coupons', action: 'create' },
  '/admin/coupons/edit': { resource: 'coupons', action: 'update' },
  '/admin/coupons/delete': { resource: 'coupons', action: 'delete' },
  
  '/admin/reports': { resource: 'reports', action: 'read' },
  '/admin/reports/create': { resource: 'reports', action: 'create' },
  '/admin/reports/edit': { resource: 'reports', action: 'update' },
  '/admin/reports/delete': { resource: 'reports', action: 'delete' },
  
  '/admin/users': { resource: 'users', action: 'read' },
  '/admin/users/create': { resource: 'users', action: 'create' },
  '/admin/users/edit': { resource: 'users', action: 'update' },
  '/admin/users/delete': { resource: 'users', action: 'delete' },
  
  '/admin/permissions': { resource: 'users', action: 'read' },
  '/admin/company-settings': { resource: 'company-settings', action: 'read' },
  '/admin/company-settings/edit': { resource: 'company-settings', action: 'update' },
};

// Helper function to get token from request
function getTokenFromRequest(req: NextRequest): string | null {
  // First try to get from cookies
  const cookieToken = req.cookies.get("user-token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Then try to get from Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

// Helper function to verify JWT token
async function verifyToken(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, payload };
  } catch (error) {

    return { valid: false, error: "Invalid or expired token" };
  }
}

// Helper function to check if user has permission
async function checkUserPermission(
  token: string,
  resource: string, 
  action: string
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/permissions/check-my-permission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ resource, action }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.data?.hasPermission || false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const pathname = req.nextUrl.pathname;

  // Define routes
  const publicRoutes = ["/auth", "/signin", "/signup", "/forgot-password", "/"];
  const privateRoutes = [
    "/admin/dashboard",
    "/profile", 
    "/settings",
    "/checkout",
    "/account",
    "/my-orders",
    "/admin"
  ];

  if(token && pathname === '/signin'){
    return NextResponse.redirect(new URL('/account', req.url));
  }
  // Check if route is private
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));
  // If no token, redirect to login
  if (!token) {
    if(isPrivateRoute){
      return NextResponse.redirect(new URL('/signin', req.url));
    }else{
      return NextResponse.next();
    }
  }


  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));


  if(pathname.startsWith('/admin')){
    const tokenResult = await verifyToken(token);
    
    if(!tokenResult.valid){
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    const isAdmin = tokenResult.payload.role === 'admin';
    console.log('isAdmin', isAdmin)
    if(!isAdmin){
      return NextResponse.redirect(new URL('/account', req.url));
    }else{
      return NextResponse.next();
    }
  }
  

  if (isPublicRoute) {
    return NextResponse.next();
  }


  if (!isPrivateRoute) {
    return NextResponse.next();
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};