export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource = 
  | 'users' 
  | 'products' 
  | 'categories' 
  | 'orders' 
  | 'coupons' 
  | 'content' 
  | 'reports' 
  | 'company-settings'
  | 'shipping-addresses';

export interface Permission {
  _id: string;
  name: string;
  resource: PermissionResource;
  action: PermissionAction;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  _id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCheck {
  userId: string;
  resource: PermissionResource;
  action: PermissionAction;
}

export interface PermissionResult {
  hasPermission: boolean;
  reason?: string;
}

export interface PermissionState {
  // Current user permissions
  currentUserPermissions: Permission[];
  currentUserRoles: Role[];
  
  // All permissions and roles (for admin management)
  permissions: Permission[];
  roles: Role[];
  userRoles: UserRole[];
  
  // Loading states
  isLoadingPermissions: boolean;
  isLoadingRoles: boolean;
  isLoadingUserRoles: boolean;
  isLoadingCurrentUser: boolean;
  
  // Error states
  permissionsError: string | null;
  rolesError: string | null;
  userRolesError: string | null;
  currentUserError: string | null;
  
  // UI state
  selectedRole: Role | null;
  selectedUser: string | null;
  isPermissionModalOpen: boolean;
  isRoleModalOpen: boolean;
  isUserRoleModalOpen: boolean;
  
  // Permission checking cache
  permissionCache: Record<string, PermissionResult>;
}

export interface CreatePermissionRequest {
  name: string;
  resource: PermissionResource;
  action: PermissionAction;
  description?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
}

export interface RemoveRoleRequest {
  userId: string;
  roleId: string;
}

export interface AddPermissionsToRoleRequest {
  permissionIds: string[];
}

export interface RemovePermissionsFromRoleRequest {
  permissionIds: string[];
}
