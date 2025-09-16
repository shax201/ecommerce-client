import { apiSlice } from '../api/apiSlice';
import {
  Permission,
  Role,
  UserRole,
  PermissionCheck,
  PermissionResult,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  RemoveRoleRequest,
  AddPermissionsToRoleRequest,
  RemovePermissionsFromRoleRequest,
} from '@/types/permission.types';

export const permissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ===== PERMISSION ENDPOINTS =====
    
    // Get all permissions
    getPermissions: builder.query<Permission[], void>({
      query: () => '/permissions/permissions',
      transformResponse: (response: { success: boolean; data: Permission[] }) => response.data,
      providesTags: ['Permission'],
    }),
    
    // Get permission by ID
    getPermissionById: builder.query<Permission, string>({
      query: (id) => `/permissions/permissions/${id}`,
      transformResponse: (response: { success: boolean; data: Permission }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Permission', id }],
    }),
    
    // Create permission
    createPermission: builder.mutation<Permission, CreatePermissionRequest>({
      query: (data) => ({
        url: '/permissions/permissions',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: Permission }) => response.data,
      invalidatesTags: ['Permission'],
    }),
    
    // Update permission
    updatePermission: builder.mutation<Permission, { id: string; data: UpdatePermissionRequest }>({
      query: ({ id, data }) => ({
        url: `/permissions/permissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: Permission }) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Permission', id }],
    }),
    
    // Delete permission
    deletePermission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/permissions/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),
    
    // ===== ROLE ENDPOINTS =====
    
    // Get all roles
    getRoles: builder.query<Role[], void>({
      query: () => '/permissions/roles',
      transformResponse: (response: { success: boolean; data: Role[] }) => response.data,
      providesTags: ['Role'],
    }),
    
    // Get role by ID
    getRoleById: builder.query<Role, string>({
      query: (id) => `/permissions/roles/${id}`,
      transformResponse: (response: { success: boolean; data: Role }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),
    
    // Create role
    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (data) => ({
        url: '/permissions/roles',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: Role }) => response.data,
      invalidatesTags: ['Role'],
    }),
    
    // Update role
    updateRole: builder.mutation<Role, { id: string; data: UpdateRoleRequest }>({
      query: ({ id, data }) => ({
        url: `/permissions/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: Role }) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }],
    }),
    
    // Delete role
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/permissions/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
    
    // Add permissions to role
    addPermissionsToRole: builder.mutation<Role, { id: string; data: AddPermissionsToRoleRequest }>({
      query: ({ id, data }) => ({
        url: `/permissions/roles/${id}/permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }],
    }),
    
    // Remove permissions from role
    removePermissionsFromRole: builder.mutation<Role, { id: string; data: RemovePermissionsFromRoleRequest }>({
      query: ({ id, data }) => ({
        url: `/permissions/roles/${id}/permissions`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }],
    }),
    
    // ===== USER ROLE ENDPOINTS =====
    
    // Get user roles
    getUserRoles: builder.query<UserRole[], string>({
      query: (userId) => `/permissions/user-roles/${userId}`,
      transformResponse: (response: { success: boolean; data: UserRole[] }) => response.data,
      providesTags: (result, error, userId) => [{ type: 'UserRole', id: userId }],
    }),
    
    // Assign role to user
    assignRoleToUser: builder.mutation<UserRole, AssignRoleRequest>({
      query: (data) => ({
        url: '/permissions/user-roles/assign',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: UserRole }) => response.data,
      invalidatesTags: ['UserRole'],
    }),
    
    // Remove role from user
    removeRoleFromUser: builder.mutation<void, RemoveRoleRequest>({
      query: (data) => ({
        url: '/permissions/user-roles/remove',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['UserRole'],
    }),
    
    // ===== CURRENT USER PERMISSION ENDPOINTS =====
    
    // Get current user permissions
    getCurrentUserPermissions: builder.query<Permission[], void>({
      query: () => '/permissions/my-permissions',
      transformResponse: (response: { success: boolean; data: Permission[] }) => response.data,
      providesTags: ['CurrentUserPermissions'],
    }),
    
    // Check current user permission
    checkCurrentUserPermission: builder.mutation<PermissionResult, Omit<PermissionCheck, 'userId'>>({
      query: (data) => ({
        url: '/permissions/check-my-permission',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: PermissionResult }) => response.data,
    }),
    
    // Check user permission (admin only)
    checkUserPermission: builder.mutation<PermissionResult, PermissionCheck>({
      query: (data) => ({
        url: '/permissions/check-permission',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: PermissionResult }) => response.data,
    }),
    
    // Get user permissions (admin only)
    getUserPermissions: builder.query<Permission[], string>({
      query: (userId) => `/permissions/user-permissions/${userId}`,
      transformResponse: (response: { success: boolean; data: Permission[] }) => response.data,
      providesTags: (result, error, userId) => [{ type: 'UserPermissions', id: userId }],
    }),
    
    // ===== UTILITY ENDPOINTS =====
    
    // Initialize default data
    initializeDefaultData: builder.mutation<void, void>({
      query: () => ({
        url: '/permissions/initialize',
        method: 'POST',
      }),
      invalidatesTags: ['Permission', 'Role'],
    }),
  }),
});

export const {
  // Permission hooks
  useGetPermissionsQuery,
  useGetPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  
  // Role hooks
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAddPermissionsToRoleMutation,
  useRemovePermissionsFromRoleMutation,
  
  // User role hooks
  useGetUserRolesQuery,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
  
  // Current user permission hooks
  useGetCurrentUserPermissionsQuery,
  useCheckCurrentUserPermissionMutation,
  useCheckUserPermissionMutation,
  useGetUserPermissionsQuery,
  
  // Utility hooks
  useInitializeDefaultDataMutation,
} = permissionApi;
