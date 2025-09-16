import { apiSlice } from '../api/apiSlice';
import { User, UserQuery, UserStats, CreateUserData, UpdateUserData, BulkOperationData } from '@/lib/services/user-management-service';

// Login request/response types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Password change types
interface ChangePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordRequest {
  id: string;
  newPassword: string;
}

// Status update types
interface UpdateStatusRequest {
  id: string;
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

// Role update types
interface UpdateRoleRequest {
  id: string;
  role: 'admin' | 'client';
  permissions?: string[];
}

export const userManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    loginUser: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/user-management/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => response,
    }),

    // Get users with pagination and filtering
    getUsers: builder.query<{
      success: boolean;
      data: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      message: string;
    }, UserQuery>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        return {
          url: '/user-management',
          params: Object.fromEntries(searchParams),
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      transformResponse: (response: any) => response,
    }),

    // Get user by ID
    getUserById: builder.query<{
      success: boolean;
      data: User;
      message: string;
    }, string>({
      query: (id) => `/user-management/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response: any) => response,
    }),

    // Get user statistics
    getUserStats: builder.query<{
      success: boolean;
      data: UserStats;
      message: string;
    }, void>({
      query: () => '/user-management/stats',
      providesTags: [{ type: 'User', id: 'STATS' }],
      transformResponse: (response: any) => response,
    }),

    // Search users
    searchUsers: builder.query<{
      success: boolean;
      data: User[];
      message: string;
    }, { searchTerm: string; filters?: { role?: string; status?: string } }>({
      query: ({ searchTerm, filters = {} }) => {
        const searchParams = new URLSearchParams({ q: searchTerm });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            searchParams.append(key, value);
          }
        });
        return {
          url: '/user-management/search',
          params: Object.fromEntries(searchParams),
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'SEARCH' },
            ]
          : [{ type: 'User', id: 'SEARCH' }],
      transformResponse: (response: any) => response,
    }),

    // Create user
    createUser: builder.mutation<{
      success: boolean;
      data: User;
      message: string;
    }, CreateUserData>({
      query: (userData) => ({
        url: '/user-management',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        { type: 'User', id: 'STATS' },
      ],
      transformResponse: (response: any) => response,
    }),

    // Update user
    updateUser: builder.mutation<{
      success: boolean;
      data: User;
      message: string;
    }, { id: string; userData: UpdateUserData }>({
      query: ({ id, userData }) => ({
        url: `/user-management/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'User', id: 'STATS' },
      ],
      transformResponse: (response: any) => response,
    }),

    // Delete user
    deleteUser: builder.mutation<{
      success: boolean;
      message: string;
    }, string>({
      query: (id) => ({
        url: `/user-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'User', id: 'STATS' },
      ],
      transformResponse: (response: any) => response,
    }),

    // Update user status
    updateUserStatus: builder.mutation<{
      success: boolean;
      data: User;
      message: string;
    }, UpdateStatusRequest>({
      query: ({ id, status, reason }) => ({
        url: `/user-management/${id}/status`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'User', id: 'STATS' },
      ],
      transformResponse: (response: any) => response,
    }),

    // Update user role
    updateUserRole: builder.mutation<{
      success: boolean;
      data: User;
      message: string;
    }, UpdateRoleRequest>({
      query: ({ id, role, permissions }) => ({
        url: `/user-management/${id}/role`,
        method: 'PUT',
        body: { role, permissions },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'User', id: 'STATS' },
      ],
      transformResponse: (response: any) => response,
    }),

    // Change password
    changePassword: builder.mutation<{
      success: boolean;
      message: string;
    }, ChangePasswordRequest>({
      query: ({ id, currentPassword, newPassword, confirmPassword }) => ({
        url: `/user-management/${id}/password`,
        method: 'PUT',
        body: { currentPassword, newPassword, confirmPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
      transformResponse: (response: any) => response,
    }),

    // Reset password
    resetPassword: builder.mutation<{
      success: boolean;
      message: string;
    }, ResetPasswordRequest>({
      query: ({ id, newPassword }) => ({
        url: `/user-management/${id}/reset-password`,
        method: 'PUT',
        body: { newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
      transformResponse: (response: any) => response,
    }),

    // Bulk operations
    bulkOperation: builder.mutation<{
      success: boolean;
      data: any;
      message: string;
    }, BulkOperationData>({
      query: (data) => ({
        url: '/user-management/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        { type: 'User', id: 'STATS' },
      ],
      transformResponse: (response: any) => response,
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserStatsQuery,
  useSearchUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useBulkOperationMutation,
} = userManagementApi;
