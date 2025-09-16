import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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

// Helper function to extract user ID from token
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('user-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) return null;
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    return payload.userId as string || null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function permissionMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Check if the route requires permission checking
  const requiredPermission = ROUTE_PERMISSIONS[pathname];
  if (!requiredPermission) {
    return null; // No permission check required
  }
  
  // Get token from request
  const token = request.cookies.get('user-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check if user has the required permission
  const hasPermission = await checkUserPermission(
    token, 
    requiredPermission.resource, 
    requiredPermission.action
  );
  
  if (!hasPermission) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return null; // Permission granted, continue
}
