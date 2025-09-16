'use client';

import React from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '@/lib/features/permissions';
import { PermissionResource, PermissionAction } from '@/types/permission.types';

interface PermissionGateProps {
  resource: PermissionResource;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

interface MultiplePermissionGateProps {
  permissions: Array<{ resource: PermissionResource; action: PermissionAction }>;
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Component that renders children only if user has the specified permission
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  children,
  fallback = null,
  loading = null
}) => {
  const { hasPermission, isLoading } = useHasPermission(resource, action);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Component that renders children only if user has any/all of the specified permissions
 */
export const MultiplePermissionGate: React.FC<MultiplePermissionGateProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback = null,
  loading = null
}) => {
  const { hasPermission, isLoading } = requireAll 
    ? useHasAllPermissions(permissions)
    : useHasAnyPermission(permissions);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  resource: PermissionResource,
  action: PermissionAction,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <PermissionGate resource={resource} action={action} fallback={fallback}>
      <Component {...props} />
    </PermissionGate>
  );
};

/**
 * Higher-order component for multiple permission-based rendering
 */
export const withMultiplePermissions = <P extends object>(
  Component: React.ComponentType<P>,
  permissions: Array<{ resource: PermissionResource; action: PermissionAction }>,
  requireAll: boolean = false,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <MultiplePermissionGate 
      permissions={permissions} 
      requireAll={requireAll} 
      fallback={fallback}
    >
      <Component {...props} />
    </MultiplePermissionGate>
  );
};

export default PermissionGate;
