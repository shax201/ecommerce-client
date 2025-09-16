import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetCurrentUserPermissionsQuery, useCheckCurrentUserPermissionMutation } from './permissionApi';
import { setCurrentUserPermissions, setCurrentUserError, setCurrentUserLoading, setPermissionCache } from './permissionSlice';
import { useEffect } from 'react';
import { PermissionResource, PermissionAction } from '@/types/permission.types';
import { hasPermission, hasAnyPermission, hasAllPermissions, createPermissionKey } from './permissionUtils';

/**
 * Hook to manage current user permissions
 */
export const useCurrentUserPermissions = () => {
  const dispatch = useDispatch();
  const { currentUserPermissions, isLoadingCurrentUser, currentUserError } = useSelector(
    (state: RootState) => state.permissions
  );

  const {
    data: permissions,
    isLoading,
    error,
    refetch
  } = useGetCurrentUserPermissionsQuery();

  useEffect(() => {
    if (permissions) {
      dispatch(setCurrentUserPermissions(permissions));
    }
  }, [permissions, dispatch]);

  useEffect(() => {
    dispatch(setCurrentUserLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (error) {
      const errorMessage = 'data' in error ? 
        (error.data as any)?.message || 'Failed to fetch permissions' : 
        'Failed to fetch permissions';
      dispatch(setCurrentUserError(errorMessage));
    }
  }, [error, dispatch]);

  return {
    permissions: currentUserPermissions,
    isLoading: isLoadingCurrentUser,
    error: currentUserError,
    refetch
  };
};

/**
 * Hook to check if current user has a specific permission
 */
export const useHasPermission = (resource: PermissionResource, action: PermissionAction) => {
  const { permissions, isLoading } = useCurrentUserPermissions();
  
  if (isLoading) {
    return { hasPermission: false, isLoading: true };
  }

  // If permissions is not an array, return false
  if (!permissions || !Array.isArray(permissions)) {
    return { hasPermission: false, isLoading: false };
  }

  return {
    hasPermission: hasPermission(permissions, resource, action),
    isLoading: false
  };
};

/**
 * Hook to check if current user has any of the specified permissions
 */
export const useHasAnyPermission = (
  permissionChecks: Array<{ resource: PermissionResource; action: PermissionAction }>
) => {
  const { permissions, isLoading } = useCurrentUserPermissions();
  
  if (isLoading) {
    return { hasPermission: false, isLoading: true };
  }

  // If permissions is not an array, return false
  if (!permissions || !Array.isArray(permissions)) {
    return { hasPermission: false, isLoading: false };
  }

  return {
    hasPermission: hasAnyPermission(permissions, permissionChecks),
    isLoading: false
  };
};

/**
 * Hook to check if current user has all of the specified permissions
 */
export const useHasAllPermissions = (
  permissionChecks: Array<{ resource: PermissionResource; action: PermissionAction }>
) => {
  const { permissions, isLoading } = useCurrentUserPermissions();
  
  if (isLoading) {
    return { hasPermission: false, isLoading: true };
  }

  // If permissions is not an array, return false
  if (!permissions || !Array.isArray(permissions)) {
    return { hasPermission: false, isLoading: false };
  }

  return {
    hasPermission: hasAllPermissions(permissions, permissionChecks),
    isLoading: false
  };
};

/**
 * Hook to check permission with caching
 */
export const useCheckPermission = () => {
  const dispatch = useDispatch();
  const { permissionCache } = useSelector((state: RootState) => state.permissions);
  const [checkPermission, { isLoading }] = useCheckCurrentUserPermissionMutation();

  const checkPermissionWithCache = async (
    resource: PermissionResource,
    action: PermissionAction
  ) => {
    const key = createPermissionKey(resource, action);
    
    // Check cache first
    if (permissionCache[key]) {
      return permissionCache[key];
    }

    try {
      const result = await checkPermission({ resource, action }).unwrap();
      dispatch(setPermissionCache({ key, result }));
      return result;
    } catch (error) {
      return {
        hasPermission: false,
        reason: 'Failed to check permission'
      };
    }
  };

  return {
    checkPermission: checkPermissionWithCache,
    isLoading
  };
};

/**
 * Hook for permission-based component rendering
 */
export const usePermissionGate = (
  resource: PermissionResource,
  action: PermissionAction,
  fallback?: React.ReactNode
) => {
  const { hasPermission, isLoading } = useHasPermission(resource, action);

  if (isLoading) {
    return null; // or loading spinner
  }

  if (!hasPermission) {
    return fallback || null;
  }

  return true;
};

/**
 * Hook for multiple permission checks
 */
export const usePermissionGates = (
  permissionChecks: Array<{ resource: PermissionResource; action: PermissionAction }>,
  requireAll: boolean = false
) => {
  const { permissions, isLoading } = useCurrentUserPermissions();
  
  if (isLoading) {
    return { hasPermission: false, isLoading: true };
  }

  // If permissions is not an array, return false
  if (!permissions || !Array.isArray(permissions)) {
    return { hasPermission: false, isLoading: false };
  }

  const hasPermission = requireAll 
    ? hasAllPermissions(permissions, permissionChecks)
    : hasAnyPermission(permissions, permissionChecks);

  return {
    hasPermission,
    isLoading: false
  };
};

/**
 * Hook to get permissions for a specific resource
 */
export const useResourcePermissions = (resource: PermissionResource) => {
  const { permissions, isLoading } = useCurrentUserPermissions();
  
  if (isLoading) {
    return { permissions: [], isLoading: true };
  }

  // If permissions is not an array, return empty array
  if (!permissions || !Array.isArray(permissions)) {
    return { 
      permissions: [], 
      isLoading: false,
      hasCreate: false,
      hasRead: false,
      hasUpdate: false,
      hasDelete: false,
    };
  }

  const resourcePermissions = permissions.filter(p => p.resource === resource);

  return {
    permissions: resourcePermissions,
    isLoading: false,
    hasCreate: resourcePermissions.some(p => p.action === 'create'),
    hasRead: resourcePermissions.some(p => p.action === 'read'),
    hasUpdate: resourcePermissions.some(p => p.action === 'update'),
    hasDelete: resourcePermissions.some(p => p.action === 'delete'),
  };
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = () => {
  const { currentUserRoles } = useSelector((state: RootState) => state.permissions);
  
  return currentUserRoles.some(role => 
    role.name.toLowerCase().includes('admin') || 
    role.name.toLowerCase().includes('super')
  );
};

/**
 * Hook to check if user is manager
 */
export const useIsManager = () => {
  const { currentUserRoles } = useSelector((state: RootState) => state.permissions);
  
  return currentUserRoles.some(role => 
    role.name.toLowerCase().includes('manager')
  );
};

/**
 * Hook to check if user is viewer
 */
export const useIsViewer = () => {
  const { currentUserRoles } = useSelector((state: RootState) => state.permissions);
  
  return currentUserRoles.some(role => 
    role.name.toLowerCase().includes('viewer')
  );
};
