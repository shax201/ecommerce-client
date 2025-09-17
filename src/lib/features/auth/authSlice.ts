import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./authApi";

interface AuthState {
  user: User | null;
  admin: User | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
}

const initialState: AuthState = {
  user: null,
  admin: null,
  isAuthenticated: false,
  isAdminAuthenticated: false,
  isLoading: false,
  error: null,
  isLoginModalOpen: false,
  isSignupModalOpen: false,
  isForgotPasswordModalOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setAdmin: (state, action: PayloadAction<User | null>) => {
      state.admin = action.payload;
      state.isAdminAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalOpen = action.payload;
    },
    setSignupModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSignupModalOpen = action.payload;
    },
    setForgotPasswordModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isForgotPasswordModalOpen = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("user-token");
        localStorage.removeItem("user");
        localStorage.removeItem("client");
        // Note: Cookie clearing is handled by the logout mutation
      }
    },
    adminLogout: (state) => {
      state.admin = null;
      state.isAdminAuthenticated = false;
      state.error = null;
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin");
        localStorage.removeItem("user-token");
        localStorage.removeItem("user");
        localStorage.removeItem("client");
        // Note: Cookie clearing is handled by the logout mutation
      }
    },
    initializeAuth: (state) => {
      // Set loading to true during initialization
      state.isLoading = true;
      
      // Initialize auth state from localStorage
      if (typeof window !== 'undefined') {
        const client = localStorage.getItem("client");
        const token = localStorage.getItem("user-token");
        const admin = localStorage.getItem("admin");
        const adminToken = localStorage.getItem("admin-token");
        
        console.log("Initializing auth state:", {
          hasClient: !!client,
          hasToken: !!token,
          hasAdmin: !!admin,
          hasAdminToken: !!adminToken
        });
        
        // Initialize user auth - check both 'user' and 'client' for backward compatibility
        const userData = localStorage.getItem("user") || client;
        if (userData && token) {
          try {
            state.user = JSON.parse(userData);
            state.isAuthenticated = true;
            console.log("User authenticated from localStorage");
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            // Clear invalid data
            localStorage.removeItem("user");
            localStorage.removeItem("client");
            localStorage.removeItem("user-token");
          }
        }

        // Initialize admin auth - check for admin data and any valid token
        if (admin) {
          try {
            const adminData = JSON.parse(admin);
            // Check if we have a valid token (either admin-token or user-token)
            if (adminToken || token) {
              state.admin = adminData;
              state.isAdminAuthenticated = true;
              console.log("Admin authenticated from localStorage");
            } else {
              console.log("Admin data found but no valid token, clearing admin state");
              localStorage.removeItem("admin");
            }
          } catch (error) {
            console.error("Error parsing admin data from localStorage:", error);
            // Clear invalid data
            localStorage.removeItem("admin");
            localStorage.removeItem("admin-token");
            localStorage.removeItem("user-token");
          }
        }
      }
      
      // Set loading to false after initialization
      state.isLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.isAdminAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isLoginModalOpen = false;
      state.isSignupModalOpen = false;
      state.isForgotPasswordModalOpen = false;
    },
  },
});

export const {
  setUser,
  setAdmin,
  setLoading,
  setError,
  clearError,
  setLoginModalOpen,
  setSignupModalOpen,
  setForgotPasswordModalOpen,
  logout,
  adminLogout,
  initializeAuth,
  setAuthLoading,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
