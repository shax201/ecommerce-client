'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useCurrentUserPermissions } from '@/lib/features/permissions';

interface PermissionProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes user permissions on app start
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  // Get auth state from Redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { permissions, isLoading, error, refetch } = useCurrentUserPermissions();

  useEffect(() => {
    // Only fetch permissions if user is authenticated and we don't have permissions yet
    if (isAuthenticated && user && permissions.length === 0 && !isLoading && !error) {
      refetch();
    }
  }, [isAuthenticated, user, permissions.length, isLoading, error, refetch]);

  // You can add additional permission initialization logic here
  // For example, setting up permission-based feature flags, etc.

  return <>{children}</>;
};

export default PermissionProvider;
