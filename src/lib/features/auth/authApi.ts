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
    user: User;
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
    // Unified login for both admin and client
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/user-management/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: async (response: AuthResponse) => {
        // Store token and user data in localStorage after successful login
        if (typeof window !== 'undefined' && response.success) {
          const user = response.data.user;
          const token = response.data.token;
          
          // Clear all existing auth data
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin");
          localStorage.removeItem("user-token");
          localStorage.removeItem("client");
          console.log("✅ [Unified Login] Cleared all existing auth data");
          
          // Store unified user data
          localStorage.setItem("user-token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Store role-specific data for backward compatibility
          if (user.role === 'admin') {
            localStorage.setItem("admin-token", token);
            localStorage.setItem("admin", JSON.stringify(user));
          } else {
            localStorage.setItem("client", JSON.stringify(user));
          }
          
          console.log(`✅ [Unified Login] ${user.role} login successful - data stored in localStorage`);
          
          // Set cookie for middleware
          try {
            await setAuthCookie(token);
          } catch (error) {
            console.error("❌ [Unified Login] Failed to set cookie:", error);
          }
        }
        return response;
      },
    }),

    // Signup user
    signup: builder.mutation<AuthResponse, SignupCredentials>({
      query: (credentials) => ({
        url: "/user-management/",
        method: "POST",
        body: {
          ...credentials,
          role: 'client' // Ensure role is set to client
        },
      }),
      transformResponse: async (response: AuthResponse) => {
        // Store token and user data in localStorage after successful signup
        if (typeof window !== 'undefined' && response.success) {
          const user = response.data.user;
          const token = response.data.token;
          
          // Clear all existing auth data
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin");
          localStorage.removeItem("user-token");
          localStorage.removeItem("client");
          console.log("✅ [Unified Signup] Cleared all existing auth data");
          
          // Store unified user data
          localStorage.setItem("user-token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Store role-specific data for backward compatibility
          if (user.role === 'admin') {
            localStorage.setItem("admin-token", token);
            localStorage.setItem("admin", JSON.stringify(user));
          } else {
            localStorage.setItem("client", JSON.stringify(user));
          }
          
          console.log(`✅ [Unified Signup] ${user.role} signup successful - data stored in localStorage`);
          
          // Set cookie for middleware
          try {
            await setAuthCookie(token);
          } catch (error) {
            console.error("❌ [Unified Signup] Failed to set cookie:", error);
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

  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
} = authApi;
