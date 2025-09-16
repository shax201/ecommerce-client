import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PermissionState, Permission, Role, UserRole, PermissionResult } from '@/types/permission.types';

const initialState: PermissionState = {
  // Current user permissions
  currentUserPermissions: [],
  currentUserRoles: [],
  
  // All permissions and roles (for admin management)
  permissions: [],
  roles: [],
  userRoles: [],
  
  // Loading states
  isLoadingPermissions: false,
  isLoadingRoles: false,
  isLoadingUserRoles: false,
  isLoadingCurrentUser: false,
  
  // Error states
  permissionsError: null,
  rolesError: null,
  userRolesError: null,
  currentUserError: null,
  
  // UI state
  selectedRole: null,
  selectedUser: null,
  isPermissionModalOpen: false,
  isRoleModalOpen: false,
  isUserRoleModalOpen: false,
  
  // Permission checking cache
  permissionCache: {},
};

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // ===== CURRENT USER PERMISSIONS =====
    
    setCurrentUserPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.currentUserPermissions = action.payload;
      state.isLoadingCurrentUser = false;
      state.currentUserError = null;
    },
    
    setCurrentUserRoles: (state, action: PayloadAction<Role[]>) => {
      state.currentUserRoles = action.payload;
    },
    
    setCurrentUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingCurrentUser = action.payload;
    },
    
    setCurrentUserError: (state, action: PayloadAction<string | null>) => {
      state.currentUserError = action.payload;
      state.isLoadingCurrentUser = false;
    },
    
    // ===== PERMISSIONS MANAGEMENT =====
    
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
      state.isLoadingPermissions = false;
      state.permissionsError = null;
    },
    
    addPermission: (state, action: PayloadAction<Permission>) => {
      state.permissions.push(action.payload);
    },
    
    updatePermission: (state, action: PayloadAction<Permission>) => {
      const index = state.permissions.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.permissions[index] = action.payload;
      }
    },
    
    removePermission: (state, action: PayloadAction<string>) => {
      state.permissions = state.permissions.filter(p => p._id !== action.payload);
    },
    
    setPermissionsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPermissions = action.payload;
    },
    
    setPermissionsError: (state, action: PayloadAction<string | null>) => {
      state.permissionsError = action.payload;
      state.isLoadingPermissions = false;
    },
    
    // ===== ROLES MANAGEMENT =====
    
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
      state.isLoadingRoles = false;
      state.rolesError = null;
    },
    
    addRole: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
    },
    
    updateRole: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    
    removeRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter(r => r._id !== action.payload);
    },
    
    setRolesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingRoles = action.payload;
    },
    
    setRolesError: (state, action: PayloadAction<string | null>) => {
      state.rolesError = action.payload;
      state.isLoadingRoles = false;
    },
    
    // ===== USER ROLES MANAGEMENT =====
    
    setUserRoles: (state, action: PayloadAction<UserRole[]>) => {
      state.userRoles = action.payload;
      state.isLoadingUserRoles = false;
      state.userRolesError = null;
    },
    
    addUserRole: (state, action: PayloadAction<UserRole>) => {
      state.userRoles.push(action.payload);
    },
    
    removeUserRole: (state, action: PayloadAction<{ userId: string; roleId: string }>) => {
      state.userRoles = state.userRoles.filter(
        ur => !(ur.userId === action.payload.userId && ur.roleId === action.payload.roleId)
      );
    },
    
    setUserRolesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUserRoles = action.payload;
    },
    
    setUserRolesError: (state, action: PayloadAction<string | null>) => {
      state.userRolesError = action.payload;
      state.isLoadingUserRoles = false;
    },
    
    // ===== UI STATE =====
    
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    
    setSelectedUser: (state, action: PayloadAction<string | null>) => {
      state.selectedUser = action.payload;
    },
    
    setPermissionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPermissionModalOpen = action.payload;
    },
    
    setRoleModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isRoleModalOpen = action.payload;
    },
    
    setUserRoleModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isUserRoleModalOpen = action.payload;
    },
    
    // ===== PERMISSION CACHE =====
    
    setPermissionCache: (state, action: PayloadAction<{ key: string; result: PermissionResult }>) => {
      state.permissionCache[action.payload.key] = action.payload.result;
    },
    
    clearPermissionCache: (state) => {
      state.permissionCache = {};
    },
    
    // ===== UTILITY ACTIONS =====
    
    clearErrors: (state) => {
      state.permissionsError = null;
      state.rolesError = null;
      state.userRolesError = null;
      state.currentUserError = null;
    },
    
    resetPermissionState: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  // Current user permissions
  setCurrentUserPermissions,
  setCurrentUserRoles,
  setCurrentUserLoading,
  setCurrentUserError,
  
  // Permissions management
  setPermissions,
  addPermission,
  updatePermission,
  removePermission,
  setPermissionsLoading,
  setPermissionsError,
  
  // Roles management
  setRoles,
  addRole,
  updateRole,
  removeRole,
  setRolesLoading,
  setRolesError,
  
  // User roles management
  setUserRoles,
  addUserRole,
  removeUserRole,
  setUserRolesLoading,
  setUserRolesError,
  
  // UI state
  setSelectedRole,
  setSelectedUser,
  setPermissionModalOpen,
  setRoleModalOpen,
  setUserRoleModalOpen,
  
  // Permission cache
  setPermissionCache,
  clearPermissionCache,
  
  // Utility actions
  clearErrors,
  resetPermissionState,
} = permissionSlice.actions;

export default permissionSlice.reducer;
