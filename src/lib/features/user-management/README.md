# User Management with Redux and ISR

This module provides a comprehensive user management system with Redux state management and Incremental Static Regeneration (ISR) for optimal performance and user experience.

## Features

- **Redux State Management**: Centralized state management for users, filters, pagination, and UI state
- **RTK Query Integration**: Efficient API calls with caching, background updates, and optimistic updates
- **ISR Support**: Incremental Static Regeneration for better performance and SEO
- **Real-time Updates**: Automatic cache invalidation and data synchronization
- **Advanced Filtering**: Search, role-based filtering, status filtering, and sorting
- **Bulk Operations**: Select multiple users for batch operations
- **Statistics Dashboard**: Comprehensive user analytics and metrics

## Architecture

### Redux Store Structure

```typescript
interface UserManagementState {
  users: User[];
  selectedUsers: string[];
  filters: UserQuery;
  stats: UserStats | null;
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

### API Endpoints

All API calls are handled through RTK Query with automatic caching and invalidation:

- `getUsers` - Fetch users with pagination and filtering
- `getUserById` - Get single user details
- `getUserStats` - Get user statistics
- `searchUsers` - Search users with filters
- `createUser` - Create new user
- `updateUser` - Update user information
- `deleteUser` - Delete user
- `updateUserStatus` - Change user status
- `updateUserRole` - Change user role
- `changePassword` - Change user password
- `resetPassword` - Reset user password
- `bulkOperation` - Perform bulk operations

## Usage

### Basic Usage

```tsx
import { useUsersISR } from '@/hooks/use-users-isr';

function UsersPage() {
  const {
    users,
    stats,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
  } = useUsersISR({
    initialQuery: {
      page: 1,
      limit: 10,
      search: '',
      role: undefined,
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    enableStats: true,
    revalidateTime: 60, // 1 minute
  });

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

### Advanced Filtering

```tsx
import { useUsersISR } from '@/hooks/use-users-isr';

function UsersPage() {
  const { updateFilters, filters } = useUsersISR();

  const handleFilterChange = (newFilters) => {
    updateFilters({
      ...newFilters,
      page: 1, // Reset to first page when filtering
    });
  };

  return (
    <UserManagementFilters
      filters={filters}
      onFilterChange={handleFilterChange}
    />
  );
}
```

### User Search

```tsx
import { useUserSearchISR } from '@/hooks/use-users-isr';

function UserSearch() {
  const { searchResults, searchLoading, search } = useUserSearchISR();

  const handleSearch = (term) => {
    search(term, { role: 'admin' });
  };

  return (
    <div>
      {/* Search UI */}
    </div>
  );
}
```

### Statistics

```tsx
import { useUserStatsISR } from '@/hooks/use-users-isr';

function UserStats() {
  const { stats, loading, refresh } = useUserStatsISR(300); // 5 minutes

  return (
    <div>
      {/* Stats UI */}
    </div>
  );
}
```

## ISR Configuration

### Revalidation Times

- **Users**: 60 seconds (frequently changing data)
- **Stats**: 300 seconds (5 minutes)
- **Search**: Real-time with debouncing

### Cache Strategy

- **RTK Query**: Automatic caching with smart invalidation
- **Redux Persist**: Selected users and filters persisted
- **ISR**: Background revalidation with stale-while-revalidate

## Components

### UserManagementTable

Main table component with:
- User selection (single and bulk)
- Status and role management
- Action dropdowns
- Pagination
- Loading states

### UserManagementFilters

Advanced filtering component with:
- Search input
- Role filtering
- Status filtering
- Sorting options
- Items per page selection

### UserManagementStats

Statistics dashboard with:
- User counts by status and role
- Growth metrics
- Login activity
- Distribution charts

## Redux Actions

### State Management

```typescript
// Set users data
dispatch(setUsers(users));

// Update single user
dispatch(updateUser(user));

// Remove user
dispatch(removeUser(userId));

// Add new user
dispatch(addUser(user));

// Selection management
dispatch(setSelectedUsers(userIds));
dispatch(toggleUserSelection(userId));
dispatch(clearSelection());

// Filter management
dispatch(setFilters(filters));
dispatch(resetFilters());

// UI state
dispatch(setLoading(true));
dispatch(setError('Error message'));
```

### RTK Query Mutations

```typescript
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useBulkOperationMutation,
} from '@/lib/features/user-management';

function UserActions() {
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleCreateUser = async (userData) => {
    try {
      const result = await createUser(userData).unwrap();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

## Performance Optimizations

### ISR Benefits

1. **Faster Page Loads**: Pre-rendered content with background updates
2. **Reduced API Calls**: Smart caching and invalidation
3. **Better UX**: Stale-while-revalidate pattern
4. **SEO Friendly**: Pre-rendered content for search engines

### Caching Strategy

1. **RTK Query Cache**: Automatic request deduplication
2. **Redux State**: Client-side state management
3. **ISR Cache**: Server-side caching with revalidation
4. **Browser Cache**: HTTP caching headers

## Error Handling

### Global Error Handling

```typescript
// ISR error logging
logISRError('operation', error, context);

// Performance monitoring
measureISRPerformance('operation', async () => {
  // Your operation
});
```

### Component Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function UsersPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <UserManagementTable />
    </ErrorBoundary>
  );
}
```

## Best Practices

### 1. Use ISR Hooks

Always use the provided ISR hooks instead of direct API calls:

```tsx
// ✅ Good
const { users, loading } = useUsersISR();

// ❌ Avoid
const [getUsers] = useGetUsersQuery();
```

### 2. Optimize Revalidation

Set appropriate revalidation times based on data freshness requirements:

```tsx
// High-frequency data
const { users } = useUsersISR({ revalidateTime: 30 });

// Low-frequency data
const { stats } = useUserStatsISR(600);
```

### 3. Handle Loading States

Always provide loading indicators and error states:

```tsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 4. Use Redux for UI State

Keep UI state in Redux for consistency:

```tsx
const { selectedUsers, filters } = useSelector(state => state.userManagement);
```

## Troubleshooting

### Common Issues

1. **Stale Data**: Check revalidation times and cache invalidation
2. **Loading States**: Ensure proper loading state management
3. **Error Handling**: Check error boundaries and error logging
4. **Performance**: Monitor ISR performance metrics

### Debug Tools

1. **Redux DevTools**: Inspect state changes
2. **RTK Query DevTools**: Monitor API calls
3. **Console Logs**: ISR performance and error logs
4. **Network Tab**: Monitor API requests and responses

## Migration Guide

### From Server Actions to Redux + ISR

1. Replace server action calls with ISR hooks
2. Move local state to Redux store
3. Update components to use Redux selectors
4. Add error handling and loading states
5. Configure appropriate revalidation times

### Example Migration

```tsx
// Before (Server Actions)
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    const result = await getUsers(filters);
    setUsers(result.data);
    setLoading(false);
  };
  fetchUsers();
}, [filters]);

// After (Redux + ISR)
const { users, loading } = useUsersISR({ filters });
```

This implementation provides a robust, scalable, and performant user management system with modern React patterns and best practices.
