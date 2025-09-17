# User Settings Redux Integration

This module provides a comprehensive user settings system with Redux state management and RTK Query for optimal performance and user experience.

## Features

- **Redux State Management**: Centralized state management for user profile, preferences, and UI state
- **RTK Query Integration**: Efficient API calls with caching, background updates, and optimistic updates
- **Real-time Updates**: Automatic cache invalidation and data synchronization
- **Form Validation**: Client-side validation for all user inputs
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Security**: Password verification for sensitive operations

## Architecture

### Redux Store Structure

```typescript
interface UserSettingsState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  isEditing: boolean;
  activeTab: 'profile' | 'security' | 'preferences';
}
```

### API Endpoints

The `userSettingsApi.ts` provides the following endpoints:

#### Queries
- `useGetOwnProfileQuery()` - Fetch user's own profile
- `useGetOwnPreferencesQuery()` - Fetch user's own preferences

#### Mutations
- `useUpdateOwnProfileMutation()` - Update user's own profile (names)
- `useUpdateOwnEmailMutation()` - Update user's own email
- `useChangeOwnPasswordMutation()` - Change user's own password
- `useUpdateOwnPhoneMutation()` - Update user's own phone
- `useUpdateOwnPreferencesMutation()` - Update user's own preferences

## Redux Slice

The `userSettingsSlice.ts` provides:
- Local state management for user settings
- Actions for manual state updates
- Selectors for accessing state
- Error and loading state management

### Actions
- `setProfile(profile)` - Set user profile
- `setPreferences(preferences)` - Set user preferences
- `updateProfileField(field)` - Update specific profile field
- `updatePreferencesField(field)` - Update specific preferences field
- `setLoading(boolean)` - Set loading state
- `setError(string)` - Set error state
- `setSuccess(string)` - Set success state
- `setIsEditing(boolean)` - Set editing state
- `setActiveTab(tab)` - Set active tab
- `clearUserSettings()` - Clear all state
- `resetUserSettingsState()` - Reset to initial state

### Selectors
- `selectUserProfile` - Get user profile
- `selectUserPreferences` - Get user preferences
- `selectUserSettingsLoading` - Get loading state
- `selectUserSettingsError` - Get error state
- `selectUserSettingsSuccess` - Get success state
- `selectIsEditing` - Get editing state
- `selectActiveTab` - Get active tab

## Service Layer

The `userSettingsService.ts` provides:
- Direct API calls without Redux
- Validation utilities
- Helper functions for data formatting
- Token management

### Utility Functions
- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `validatePhone(phone)` - Validate phone number
- `formatPhone(phone)` - Format phone number for display
- `getFullName(profile)` - Get user's full name
- `getInitials(profile)` - Get user's initials

## Usage in Components

### Using RTK Query Hooks Directly

```tsx
import { useGetOwnProfileQuery, useUpdateOwnProfileMutation } from '@/lib/features/user-settings';

function ProfileComponent() {
  const { data: profile, isLoading, error } = useGetOwnProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateOwnProfileMutation();

  const handleUpdate = async (data) => {
    try {
      await updateProfile(data).unwrap();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <div>
      <h1>{profile?.data.firstName} {profile?.data.lastName}</h1>
      {/* Profile form */}
    </div>
  );
}
```

### Using Redux State

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { selectUserProfile, setProfile } from '@/lib/features/user-settings';

function ProfileComponent() {
  const profile = useSelector(selectUserProfile);
  const dispatch = useDispatch();

  const handleUpdate = (newProfile) => {
    dispatch(setProfile(newProfile));
  };

  return (
    <div>
      <h1>{profile?.firstName} {profile?.lastName}</h1>
      {/* Profile form */}
    </div>
  );
}
```

### Using Service Layer

```tsx
import { UserSettingsService } from '@/lib/features/user-settings/userSettingsService';

async function updateProfile(data) {
  try {
    const updatedProfile = await UserSettingsService.updateOwnProfile(data);
    return updatedProfile;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}
```

## Admin Page Components

The admin page components are located in `src/app/admin/settings/`:

- `page.tsx` - Main settings page
- `components/user-settings-tabs.tsx` - Tab navigation
- `components/user-settings-skeleton.tsx` - Loading skeleton
- `components/profile-tab.tsx` - Profile management tab
- `components/security-tab.tsx` - Security settings tab
- `components/preferences-tab.tsx` - Preferences management tab

## API Integration

The frontend integrates with the following backend endpoints:

- `GET /api/v1/user-settings/profile` - Get user profile
- `PUT /api/v1/user-settings/profile` - Update profile
- `PUT /api/v1/user-settings/email` - Update email
- `PUT /api/v1/user-settings/password` - Change password
- `PUT /api/v1/user-settings/phone` - Update phone
- `GET /api/v1/user-settings/preferences` - Get preferences
- `PUT /api/v1/user-settings/preferences` - Update preferences

## Security Features

1. **Authentication Required**: All endpoints require JWT authentication
2. **Password Verification**: Sensitive operations require current password
3. **Input Validation**: Client-side validation for all inputs
4. **Error Handling**: Secure error messages without sensitive information
5. **Token Management**: Automatic token handling in API calls

## Error Handling

The system provides comprehensive error handling:

- **Network Errors**: Automatic retry and fallback
- **Validation Errors**: Client-side validation with clear messages
- **Server Errors**: User-friendly error messages
- **Authentication Errors**: Automatic token refresh and re-authentication
