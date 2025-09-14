import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./authApi";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
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
        localStorage.removeItem("client");
        // Note: Cookie clearing is handled by the logout mutation
      }
    },
    initializeAuth: (state) => {
      // Initialize auth state from localStorage
      if (typeof window !== 'undefined') {
        const client = localStorage.getItem("client");
        const token = localStorage.getItem("user-token");
        
        if (client && token) {
          try {
            state.user = JSON.parse(client);
            state.isAuthenticated = true;
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            // Clear invalid data
            localStorage.removeItem("client");
            localStorage.removeItem("user-token");
          }
        }
      }
    },
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
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
  setLoading,
  setError,
  clearError,
  setLoginModalOpen,
  setSignupModalOpen,
  setForgotPasswordModalOpen,
  logout,
  initializeAuth,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
