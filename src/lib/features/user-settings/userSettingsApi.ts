import { apiSlice } from '../api/apiSlice';

// ===== TYPES =====

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'client';
  status: 'active' | 'inactive' | 'suspended';
  profileImage?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  permissions?: string[];
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: boolean;
}

// Request types
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePhoneRequest {
  phone?: string;
}

export interface UpdatePreferencesRequest {
  language?: string;
  currency?: string;
  notifications?: boolean;
}

// Response types
export interface UserSettingsResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// ===== API ENDPOINTS =====

export const userSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's own profile
    getOwnProfile: builder.query<UserSettingsResponse<UserProfile>, void>({
      query: () => ({
        url: '/user-settings/profile',
        method: 'GET',
      }),
      providesTags: [{ type: 'User', id: 'PROFILE' }],
      transformResponse: (response: UserSettingsResponse<UserProfile>) => response,
    }),

    // Update user's own profile (names only)
    updateOwnProfile: builder.mutation<UserSettingsResponse<UserProfile>, UpdateProfileRequest>({
      query: (profileData) => ({
        url: '/user-settings/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: [
        { type: 'User', id: 'PROFILE' },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response: UserSettingsResponse<UserProfile>) => response,
    }),

    // Update user's own email
    updateOwnEmail: builder.mutation<UserSettingsResponse<UserProfile>, UpdateEmailRequest>({
      query: (emailData) => ({
        url: '/user-settings/email',
        method: 'PUT',
        body: emailData,
      }),
      invalidatesTags: [
        { type: 'User', id: 'PROFILE' },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response: UserSettingsResponse<UserProfile>) => response,
    }),

    // Change user's own password
    changeOwnPassword: builder.mutation<UserSettingsResponse<null>, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/user-settings/password',
        method: 'PUT',
        body: passwordData,
      }),
      invalidatesTags: [{ type: 'User', id: 'PROFILE' }],
      transformResponse: (response: UserSettingsResponse<null>) => response,
    }),

    // Update user's own phone
    updateOwnPhone: builder.mutation<UserSettingsResponse<UserProfile>, UpdatePhoneRequest>({
      query: (phoneData) => ({
        url: '/user-settings/phone',
        method: 'PUT',
        body: phoneData,
      }),
      invalidatesTags: [
        { type: 'User', id: 'PROFILE' },
        { type: 'User', id: 'LIST' },
      ],
      transformResponse: (response: UserSettingsResponse<UserProfile>) => response,
    }),

    // Get user's own preferences
    getOwnPreferences: builder.query<UserSettingsResponse<UserPreferences>, void>({
      query: () => ({
        url: '/user-settings/preferences',
        method: 'GET',
      }),
      providesTags: [{ type: 'User', id: 'PREFERENCES' }],
      transformResponse: (response: UserSettingsResponse<UserPreferences>) => response,
    }),

    // Update user's own preferences
    updateOwnPreferences: builder.mutation<UserSettingsResponse<UserProfile>, UpdatePreferencesRequest>({
      query: (preferencesData) => ({
        url: '/user-settings/preferences',
        method: 'PUT',
        body: preferencesData,
      }),
      invalidatesTags: [
        { type: 'User', id: 'PROFILE' },
        { type: 'User', id: 'PREFERENCES' },
      ],
      transformResponse: (response: UserSettingsResponse<UserProfile>) => response,
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useGetOwnProfileQuery,
  useUpdateOwnProfileMutation,
  useUpdateOwnEmailMutation,
  useChangeOwnPasswordMutation,
  useUpdateOwnPhoneMutation,
  useGetOwnPreferencesQuery,
  useUpdateOwnPreferencesMutation,
} = userSettingsApi;
