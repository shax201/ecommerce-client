import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserPreferences } from './userSettingsApi';

// ===== STATE INTERFACE =====

export interface UserSettingsState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  isEditing: boolean;
  activeTab: 'profile' | 'security' | 'preferences';
}

// ===== INITIAL STATE =====

const initialState: UserSettingsState = {
  profile: null,
  preferences: null,
  loading: false,
  error: null,
  success: null,
  isEditing: false,
  activeTab: 'profile',
};

// ===== SLICE =====

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    // Set profile data
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
      state.error = null;
    },

    // Set preferences data
    setPreferences: (state, action: PayloadAction<UserPreferences | null>) => {
      state.preferences = action.payload;
      state.error = null;
    },

    // Update profile fields
    updateProfileField: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Update preferences fields
    updatePreferencesField: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
        state.success = null;
      }
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
      state.success = null;
    },

    // Set success state
    setSuccess: (state, action: PayloadAction<string | null>) => {
      state.success = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set editing state
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
      if (!action.payload) {
        state.error = null;
        state.success = null;
      }
    },

    // Set active tab
    setActiveTab: (state, action: PayloadAction<'profile' | 'security' | 'preferences'>) => {
      state.activeTab = action.payload;
      state.error = null;
      state.success = null;
    },

    // Clear all state
    clearUserSettings: (state) => {
      state.profile = null;
      state.preferences = null;
      state.loading = false;
      state.error = null;
      state.success = null;
      state.isEditing = false;
      state.activeTab = 'profile';
    },

    // Reset to initial state
    resetUserSettingsState: () => initialState,
  },
});

// ===== EXPORTED ACTIONS =====

export const {
  setProfile,
  setPreferences,
  updateProfileField,
  updatePreferencesField,
  setLoading,
  setError,
  setSuccess,
  setIsEditing,
  setActiveTab,
  clearUserSettings,
  resetUserSettingsState,
} = userSettingsSlice.actions;

// ===== SELECTORS =====

export const selectUserProfile = (state: { userSettings: UserSettingsState }) => state.userSettings.profile;
export const selectUserPreferences = (state: { userSettings: UserSettingsState }) => state.userSettings.preferences;
export const selectUserSettingsLoading = (state: { userSettings: UserSettingsState }) => state.userSettings.loading;
export const selectUserSettingsError = (state: { userSettings: UserSettingsState }) => state.userSettings.error;
export const selectUserSettingsSuccess = (state: { userSettings: UserSettingsState }) => state.userSettings.success;
export const selectIsEditing = (state: { userSettings: UserSettingsState }) => state.userSettings.isEditing;
export const selectActiveTab = (state: { userSettings: UserSettingsState }) => state.userSettings.activeTab;

// ===== REDUCER =====

export const userSettingsReducer = userSettingsSlice.reducer;
