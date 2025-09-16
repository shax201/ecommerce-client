import { apiSlice } from "../api/apiSlice";
import { setAuthCookie, clearAuthCookie } from "./authActions";

// ===== TYPES =====

export interface User {
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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    client: User;
    token: string;
  };
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  data: {
    admin: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  phone?: number;
  email: string;
  password: string;
  role?: 'client';
}

export interface AuthState {
  success?: boolean;
  message?: string;
  errors?: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  data?: any;
}

// ===== API ENDPOINTS =====

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/clients/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: async (response: AuthResponse) => {
        // Store token and user data in localStorage after successful login
        if (typeof window !== 'undefined' && response.success) {
          // Clear admin data before storing client data
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin");
          console.log("✅ [Client Login] Cleared admin tokens and data");
          
          // Store client data
          localStorage.setItem("user-token", response.data.token);
          localStorage.setItem("client", JSON.stringify(response.data.client));
          console.log("✅ [Auth API] Token and user data stored in localStorage after login");
          
          // Set cookie for middleware
          try {
            await setAuthCookie(response.data.token);
          } catch (error) {
            console.error("❌ [Auth API] Failed to set cookie:", error);
          }
        }
        return response;
      },
    }),

    // Signup user
    signup: builder.mutation<AuthResponse, SignupCredentials>({
      query: (credentials) => ({
        url: "/clients/",
        method: "POST",
        body: {
          ...credentials,
          role: 'client' // Ensure role is set to client
        },
      }),
      transformResponse: async (response: AuthResponse) => {
        // Store token and user data in localStorage after successful signup
        if (typeof window !== 'undefined' && response.success) {
          // Clear admin data before storing client data
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin");
          console.log("✅ [Client Signup] Cleared admin tokens and data");
          
          // Store client data
          localStorage.setItem("user-token", response.data.token);
          localStorage.setItem("client", JSON.stringify(response.data.client));
          console.log("✅ [Auth API] Token and user data stored in localStorage after signup");
          
          // Set cookie for middleware
          try {
            await setAuthCookie(response.data.token);
          } catch (error) {
            console.error("❌ [Auth API] Failed to set cookie:", error);
          }
        }
        return response;
      },
    }),

    // Get current user (if token exists)
    getCurrentUser: builder.query<User | null, void>({
      query: () => ({
        url: "/clients/me",
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: User }) => {
        return response.success ? response.data : null;
      },
    }),

    // Logout user
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/clients/logout",
        method: "POST",
      }),
      transformResponse: async () => {
        // Clear all localStorage data on logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem("user-token");
          localStorage.removeItem("client");
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin");
          console.log("✅ [Auth API] All user data cleared from localStorage");
          
          // Clear cookie
          try {
            await clearAuthCookie();
          } catch (error) {
            console.error("❌ [Auth API] Failed to clear cookie:", error);
          }
        }
        return { success: true, message: "Logged out successfully" };
      },
    }),

    // Forgot password
    forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: ({ email }) => ({
        url: "/clients/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    // Admin login
    adminLogin: builder.mutation<AdminAuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/admins/login", // Correct admin login endpoint
        method: "POST",
        body: credentials,
      }),
      transformResponse: async (response: AdminAuthResponse) => {
        // Store token and admin data in localStorage after successful login
        if (typeof window !== 'undefined' && response.success) {
          // Clear client data before storing admin data
          localStorage.removeItem("user-token");
          localStorage.removeItem("client");
          console.log("✅ [Admin Login] Cleared client tokens and data");
          
          // Store admin data
          localStorage.setItem("admin-token", response.data.token);
          localStorage.setItem("admin", JSON.stringify(response.data.admin));
          // Also store as user-token for middleware compatibility
          localStorage.setItem("user-token", response.data.token);
          console.log("✅ [Admin Auth API] Token and admin data stored in localStorage after login");
          
          // Set cookie for middleware
          try {
            await setAuthCookie(response.data.token);
          } catch (error) {
            console.error("❌ [Admin Auth API] Failed to set cookie:", error);
          }
        }
        return response;
      },
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useAdminLoginMutation,
} = authApi;
