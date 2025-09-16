'use client';

import React, { useEffect } from 'react';
import { useCurrentUserPermissions } from '@/lib/features/permissions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PermissionMiddlewareProps {
  children: React.ReactNode;
  requiredPermissions?: Array<{ resource: string; action: string }>;
  requireAll?: boolean;
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * Middleware component that checks permissions and handles access control
 */
export const PermissionMiddleware: React.FC<PermissionMiddlewareProps> = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  redirectTo = '/unauthorized',
  showToast = true
}) => {
  const { permissions, isLoading, error } = useCurrentUserPermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      if (showToast) {
        toast.error('Failed to load permissions');
      }
      router.push(redirectTo);
      return;
    }

    if (requiredPermissions.length === 0) return;

    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(({ resource, action }) =>
          permissions.some(p => p.resource === resource && p.action === action)
        )
      : requiredPermissions.some(({ resource, action }) =>
          permissions.some(p => p.resource === resource && p.action === action)
        );

    if (!hasRequiredPermissions) {
      if (showToast) {
        toast.error('You do not have permission to access this resource');
      }
      router.push(redirectTo);
      return;
    }
  }, [permissions, isLoading, error, requiredPermissions, requireAll, redirectTo, showToast, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">Failed to load permissions</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook for permission-based route protection
 */
export const usePermissionRoute = (
  requiredPermissions: Array<{ resource: string; action: string }>,
  requireAll: boolean = false
) => {
  const { permissions, isLoading, error } = useCurrentUserPermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || error) return;

    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(({ resource, action }) =>
          permissions.some(p => p.resource === resource && p.action === action)
        )
      : requiredPermissions.some(({ resource, action }) =>
          permissions.some(p => p.resource === resource && p.action === action)
        );

    if (!hasRequiredPermissions) {
      router.push('/unauthorized');
    }
  }, [permissions, isLoading, error, requiredPermissions, requireAll, router]);

  return { isLoading, error, hasPermission: !isLoading && !error };
};

/**
 * Higher-order component for route-level permission protection
 */
export const withPermissionRoute = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Array<{ resource: string; action: string }>,
  requireAll: boolean = false
) => {
  return (props: P) => (
    <PermissionMiddleware requiredPermissions={requiredPermissions} requireAll={requireAll}>
      <Component {...props} />
    </PermissionMiddleware>
  );
};

export default PermissionMiddleware;
