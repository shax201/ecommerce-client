# Logo Management Redux Integration

This directory contains the Redux integration for logo management functionality in the ecommerce application.

## Overview

The logo management system has been integrated with Redux Toolkit Query (RTK Query) to provide:
- Centralized state management
- Automatic caching and synchronization
- Optimistic updates
- Error handling
- ISR (Incremental Static Regeneration) integration

## Files Structure

```
logos/
├── logosApi.ts          # RTK Query API endpoints
├── logosSlice.ts        # Redux slice for local state management
├── index.ts            # Barrel exports
└── README.md           # This documentation
```

## API Endpoints

The `logosApi.ts` provides the following endpoints:

### Queries
- `useGetLogosQuery()` - Fetch all logos
- `useGetLogoByIdQuery(id)` - Fetch single logo by ID

### Mutations
- `useCreateLogoMutation()` - Create new logo
- `useUpdateLogoMutation()` - Update existing logo
- `useDeleteLogoMutation()` - Delete logo
- `useToggleLogoStatusMutation()` - Toggle logo active status

## Redux Slice

The `logosSlice.ts` provides:
- Local state management for logos
- Actions for manual state updates
- Selectors for accessing state
- Error and loading state management

### Actions
- `setLogos(logos)` - Set all logos
- `addLogo(logo)` - Add single logo
- `updateLogo(logo)` - Update single logo
- `removeLogo(id)` - Remove logo by ID
- `setLoading(boolean)` - Set loading state
- `setError(string)` - Set error state
- `clearLogos()` - Clear all logos
- `resetLogosState()` - Reset to initial state

### Selectors
- `selectAllLogos` - Get all logos
- `selectLogosLoading` - Get loading state
- `selectLogosError` - Get error state
- `selectLogoById(id)` - Get logo by ID
- `selectActiveLogos` - Get only active logos
- `selectLogosByType(type)` - Get logos by type

## Usage in Components

### Using RTK Query Hooks Directly

```tsx
import { useGetLogosQuery, useCreateLogoMutation } from '@/lib/features/logos';

function LogoComponent() {
  const { data: logosData, isLoading, error } = useGetLogosQuery();
  const [createLogo, { isLoading: isCreating }] = useCreateLogoMutation();

  const logos = logosData?.data || [];

  const handleCreate = async (logoData) => {
    try {
      await createLogo(logoData).unwrap();
      // Logo will be automatically added to cache
    } catch (error) {
      console.error('Error creating logo:', error);
    }
  };

  return (
    // Component JSX
  );
}
```

### Using the Redux Service Hook

```tsx
import { useLogoReduxService } from '@/lib/services/logo-redux-service';

function LogoComponent() {
  const {
    logos,
    loading,
    error,
    createLogo,
    updateLogo,
    deleteLogo,
    toggleLogoStatus,
    refetch
  } = useLogoReduxService();

  const handleCreate = async (logoData) => {
    try {
      await createLogo(logoData);
      // Logo will be automatically added to Redux state
    } catch (error) {
      console.error('Error creating logo:', error);
    }
  };

  return (
    // Component JSX
  );
}
```

## Integration with ISR

The logo management system integrates with Next.js ISR (Incremental Static Regeneration) through server actions:

### Server Actions
- `handleLogoCreate(id)` - Revalidate cache after logo creation
- `handleLogoUpdate(id)` - Revalidate cache after logo update
- `handleLogoDelete(id)` - Revalidate cache after logo deletion
- `handleLogoStatusToggle(id)` - Revalidate cache after status toggle
- `revalidateAllLogos()` - Revalidate all logo-related caches

### Usage in Components

```tsx
import { handleLogoCreate, handleLogoUpdate } from '@/actions/logo-redux-actions';

const handleCreate = async (logoData) => {
  try {
    const newLogo = await createLogo(logoData);
    // Trigger ISR cache revalidation
    await handleLogoCreate(newLogo.id);
  } catch (error) {
    console.error('Error creating logo:', error);
  }
};
```

## Data Flow

1. **Component** calls Redux service hook
2. **Redux Service** dispatches RTK Query mutation
3. **RTK Query** makes API call to backend
4. **Backend** processes request and returns response
5. **RTK Query** updates Redux cache automatically
6. **Component** re-renders with updated data
7. **Server Action** revalidates ISR cache (if called)

## Error Handling

The system provides comprehensive error handling:

- **RTK Query** automatically handles network errors
- **Redux Slice** manages local error state
- **Components** can access error state via selectors
- **Toast notifications** show user-friendly error messages

## Caching Strategy

- **RTK Query** provides automatic caching with configurable TTL
- **ISR** provides server-side caching for static generation
- **Redux State** provides client-side state management
- **Cache invalidation** happens automatically on mutations

## Performance Optimizations

- **Optimistic updates** for better UX
- **Automatic background refetching** when data becomes stale
- **Selective cache invalidation** to minimize unnecessary requests
- **ISR integration** for fast page loads

## Migration from Legacy Service

The system maintains backward compatibility with the legacy logo service:

1. **Legacy service** (`logo-service.ts`) still works for existing components
2. **Redux service** (`logo-redux-service.ts`) provides new Redux integration
3. **Gradual migration** is possible by updating components one by one
4. **ISR hooks** continue to work alongside Redux

## Best Practices

1. **Use Redux service hook** for new components
2. **Call server actions** after mutations for ISR integration
3. **Handle loading and error states** appropriately
4. **Use selectors** for accessing specific data
5. **Implement optimistic updates** for better UX
6. **Test error scenarios** thoroughly

## Troubleshooting

### Common Issues

1. **Cache not updating**: Check if mutations are properly invalidating tags
2. **ISR not revalidating**: Ensure server actions are called after mutations
3. **Loading states not showing**: Verify loading state selectors are used
4. **Errors not displaying**: Check error handling in components

### Debug Tools

- **Redux DevTools** for state inspection
- **Network tab** for API call monitoring
- **Console logs** for debugging information
- **ISR logs** for cache revalidation status

## Future Enhancements

- **Real-time updates** with WebSocket integration
- **Bulk operations** for multiple logo management
- **Image optimization** integration
- **Advanced caching strategies**
- **Offline support** with service workers
