# Unified Login System

## Overview
The application now uses a single, unified login form and API endpoint that handles both admin and client authentication. This simplifies the user experience and reduces code complexity.

## Key Features

### 1. Single Login Form
- **Location**: `/signin` page
- **Components**: `AuthForm.tsx` in `src/components/auth/`
- **Features**:
  - Email and password fields
  - Automatic role detection
  - Sign up and forgot password functionality
  - Clean, modern UI with proper validation

### 2. Unified API Endpoint
- **Endpoint**: `POST /api/v1/user-management/login`
- **Backend**: Handles both admin and client login in a single controller
- **Response**: Returns user data with role information
- **Frontend**: Uses single `useLoginMutation` hook

### 3. Automatic Role-Based Routing
- **Admin users**: Redirected to `/admin` dashboard
- **Client users**: Redirected to `/` (home page)
- **Detection**: Based on `user.role` field in response

## API Changes

### Frontend (`authApi.ts`)
```typescript
// Before: Separate endpoints
login: "/clients/login"
adminLogin: "/admins/login"

// After: Unified endpoint
login: "/user-management/login"
```

### Backend
The backend already had unified login logic in `client.controller.ts`:
- Checks user role from user management system
- Routes admin users to admin service
- Routes client users to user management service
- Returns consistent response format

## Response Format
```typescript
{
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: 'admin' | 'client';
      // ... other user fields
    };
    token: string;
  };
}
```

## Local Storage Management
The system maintains backward compatibility by storing data in multiple formats:
- `user-token`: Main authentication token
- `user`: Complete user object
- `admin-token` & `admin`: Admin-specific data (for admin users)
- `client`: Client-specific data (for client users)

## Benefits
1. **Simplified UX**: Single login form for all users
2. **Reduced Complexity**: One API endpoint instead of two
3. **Easier Maintenance**: Single codebase for authentication logic
4. **Better Security**: Centralized authentication handling
5. **Consistent Experience**: Same UI/UX for all user types

## Testing
To test the unified login system:
1. Start both frontend (`bun run dev`) and backend (`bun run dev`) servers
2. Navigate to `/signin`
3. Try logging in with both admin and client credentials
4. Verify proper redirection based on user role
5. Check browser localStorage for proper data storage

## Migration Notes
- Existing admin and client login flows are preserved
- No breaking changes to existing functionality
- All existing authentication logic continues to work
- Backward compatibility maintained through localStorage management
