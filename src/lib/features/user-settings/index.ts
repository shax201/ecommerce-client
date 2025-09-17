// API exports
export * from './userSettingsApi';

// Redux slice exports
export * from './userSettingsSlice';

// Re-export types for convenience
export type {
  UserProfile,
  UserPreferences,
  UpdateProfileRequest,
  UpdateEmailRequest,
  ChangePasswordRequest,
  UpdatePhoneRequest,
  UpdatePreferencesRequest,
  UserSettingsResponse,
} from './userSettingsApi';
