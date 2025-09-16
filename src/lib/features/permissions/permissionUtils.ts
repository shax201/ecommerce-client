import { Permission, Role, PermissionResource, PermissionAction } from '@/types/permission.types';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  permissions: Permission[],
  resource: PermissionResource,
  action: PermissionAction
): boolean => {
  return permissions.some(
    permission => permission.resource === resource && permission.action === action
  );
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  permissions: Permission[],
  permissionChecks: Array<{ resource: PermissionResource; action: PermissionAction }>
): boolean => {
  return permissionChecks.some(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (
  permissions: Permission[],
  permissionChecks: Array<{ resource: PermissionResource; action: PermissionAction }>
): boolean => {
  return permissionChecks.every(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
};

/**
 * Get permissions for a specific resource
 */
export const getPermissionsForResource = (
  permissions: Permission[],
  resource: PermissionResource
): Permission[] => {
  return permissions.filter(permission => permission.resource === resource);
};

/**
 * Get permissions for a specific action
 */
export const getPermissionsForAction = (
  permissions: Permission[],
  action: PermissionAction
): Permission[] => {
  return permissions.filter(permission => permission.action === action);
};

/**
 * Check if user has admin role
 */
export const isAdmin = (roles: Role[]): boolean => {
  return roles.some(role => 
    role.name.toLowerCase().includes('admin') || 
    role.name.toLowerCase().includes('super')
  );
};

/**
 * Check if user has manager role
 */
export const isManager = (roles: Role[]): boolean => {
  return roles.some(role => 
    role.name.toLowerCase().includes('manager')
  );
};

/**
 * Check if user has viewer role
 */
export const isViewer = (roles: Role[]): boolean => {
  return roles.some(role => 
    role.name.toLowerCase().includes('viewer')
  );
};

/**
 * Get role by name
 */
export const getRoleByName = (roles: Role[], name: string): Role | undefined => {
  return roles.find(role => role.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get permissions from roles
 */
export const getPermissionsFromRoles = (roles: Role[]): Permission[] => {
  const allPermissions: Permission[] = [];
  const permissionIds = new Set<string>();

  roles.forEach(role => {
    role.permissions.forEach(permission => {
      if (!permissionIds.has(permission._id)) {
        permissionIds.add(permission._id);
        allPermissions.push(permission);
      }
    });
  });

  return allPermissions;
};

/**
 * Create permission string key for caching
 */
export const createPermissionKey = (
  resource: PermissionResource,
  action: PermissionAction
): string => {
  return `${resource}:${action}`;
};

/**
 * Check if permission is for create action
 */
export const isCreatePermission = (permission: Permission): boolean => {
  return permission.action === 'create';
};

/**
 * Check if permission is for read action
 */
export const isReadPermission = (permission: Permission): boolean => {
  return permission.action === 'read';
};

/**
 * Check if permission is for update action
 */
export const isUpdatePermission = (permission: Permission): boolean => {
  return permission.action === 'update';
};

/**
 * Check if permission is for delete action
 */
export const isDeletePermission = (permission: Permission): boolean => {
  return permission.action === 'delete';
};

/**
 * Get all available resources
 */
export const getAllResources = (): PermissionResource[] => {
  return [
    'users',
    'products',
    'categories',
    'orders',
    'coupons',
    'content',
    'reports',
    'company-settings',
    'shipping-addresses'
  ];
};

/**
 * Get all available actions
 */
export const getAllActions = (): PermissionAction[] => {
  return ['create', 'read', 'update', 'delete'];
};

/**
 * Get resource display name
 */
export const getResourceDisplayName = (resource: PermissionResource): string => {
  const displayNames: Record<PermissionResource, string> = {
    'users': 'Users',
    'products': 'Products',
    'categories': 'Categories',
    'orders': 'Orders',
    'coupons': 'Coupons',
    'content': 'Content',
    'reports': 'Reports',
    'company-settings': 'Company Settings',
    'shipping-addresses': 'Shipping Addresses'
  };
  
  return displayNames[resource] || resource;
};

/**
 * Get action display name
 */
export const getActionDisplayName = (action: PermissionAction): string => {
  const displayNames: Record<PermissionAction, string> = {
    'create': 'Create',
    'read': 'Read',
    'update': 'Update',
    'delete': 'Delete'
  };
  
  return displayNames[action] || action;
};

/**
 * Group permissions by resource
 */
export const groupPermissionsByResource = (permissions: Permission[]): Record<PermissionResource, Permission[]> => {
  const grouped: Record<string, Permission[]> = {};
  
  permissions.forEach(permission => {
    if (!grouped[permission.resource]) {
      grouped[permission.resource] = [];
    }
    grouped[permission.resource].push(permission);
  });
  
  return grouped as Record<PermissionResource, Permission[]>;
};

/**
 * Group permissions by action
 */
export const groupPermissionsByAction = (permissions: Permission[]): Record<PermissionAction, Permission[]> => {
  const grouped: Record<string, Permission[]> = {};
  
  permissions.forEach(permission => {
    if (!grouped[permission.action]) {
      grouped[permission.action] = [];
    }
    grouped[permission.action].push(permission);
  });
  
  return grouped as Record<PermissionAction, Permission[]>;
};
