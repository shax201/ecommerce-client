# Footer Redux Integration Guide

This guide explains how to use Redux for footer management, specifically for the General Information section.

## Overview

The footer management system has been integrated with Redux RTK Query to provide:
- Centralized state management
- Automatic caching and synchronization
- Optimistic updates
- Error handling
- Loading states

## Files Structure

```
front-end/src/
├── lib/features/footer/
│   ├── footerSlice.ts          # Redux slice with state management
│   ├── footerApi.ts            # RTK Query API endpoints
│   └── index.ts                # Exports
├── hooks/
│   └── use-footer-redux.ts     # Custom hook for footer operations
└── components/examples/
    └── footer-redux-example.tsx # Example usage
```

## Redux Slice Features

### State Management
- **Data**: Footer information, sections, links, contact info
- **Loading States**: Loading, updating, deleting
- **Error States**: General errors, update errors, delete errors
- **UI States**: Modal states, editing states

### Actions
- `setFooter` - Set footer data
- `updateGeneralInfo` - Update general information
- `updateContactInfo` - Update contact information
- `setLoading` - Set loading state
- `setError` - Set error state
- Modal management actions

## RTK Query API Endpoints

### Available Endpoints
- `getFooter` - Fetch footer data
- `updateFooter` - Update general information
- `updateContactInfo` - Update contact information
- `addFooterSection` - Add footer section
- `updateFooterSection` - Update footer section
- `deleteFooterSection` - Delete footer section
- `addFooterLink` - Add footer link
- `updateFooterLink` - Update footer link
- `deleteFooterLink` - Delete footer link

### Automatic Features
- **Caching**: Data is automatically cached
- **Invalidation**: Cache is invalidated on mutations
- **Background Refetching**: Data is refetched when needed
- **Optimistic Updates**: UI updates immediately

## Usage Examples

### Basic Usage

```tsx
import { useFooterRedux } from '@/hooks/use-footer-redux';

function MyComponent() {
  const {
    footer,
    loading,
    updating,
    error,
    updateGeneralInfo,
    openGeneralModal,
    closeGeneralModal,
  } = useFooterRedux({ autoFetch: true });

  const handleUpdate = async (data) => {
    await updateGeneralInfo(data);
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <button onClick={openGeneralModal}>
        Edit General Info
      </button>
    </div>
  );
}
```

### General Information Update

```tsx
const handleUpdateGeneralInfo = async () => {
  const data = {
    copyright: "© 2024 My Company",
    description: "Company description",
    logoUrl: "https://example.com/logo.png",
    logoAlt: "Company Logo"
  };

  await updateGeneralInfo(data);
};
```

### Contact Information Update

```tsx
const handleUpdateContactInfo = async () => {
  const data = {
    email: "contact@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    socialMedia: {
      facebook: "https://facebook.com/company",
      twitter: "https://twitter.com/company",
      instagram: "https://instagram.com/company",
      github: "https://github.com/company"
    }
  };

  await updateContactInfo(data);
};
```

## Integration with Footer Management Component

The `FooterManagement` component has been updated to use Redux:

### Key Changes
1. **Redux Hook Integration**: Uses `useFooterRedux` for state management
2. **Modal Management**: Redux manages modal states
3. **Loading States**: Redux provides loading states
4. **Error Handling**: Redux handles errors with toast notifications
5. **Data Synchronization**: Automatic data updates via RTK Query

### General Information Section
- Uses Redux for all operations
- Modal state managed by Redux
- Loading states from Redux
- Error handling via Redux

## Benefits

### Performance
- **Caching**: Reduces API calls
- **Optimistic Updates**: Immediate UI feedback
- **Background Sync**: Automatic data updates

### Developer Experience
- **Type Safety**: Full TypeScript support
- **Centralized State**: Single source of truth
- **Automatic Error Handling**: Built-in error management
- **Loading States**: Automatic loading management

### User Experience
- **Fast Updates**: Immediate UI feedback
- **Error Notifications**: Toast notifications for errors
- **Loading Indicators**: Visual feedback during operations
- **Data Consistency**: Always up-to-date data

## Error Handling

### Error Types
- **Fetch Errors**: Network or API errors
- **Update Errors**: Validation or server errors
- **Delete Errors**: Permission or constraint errors

### Error Display
- Toast notifications for user feedback
- Console logging for debugging
- Redux state for component error handling

## Loading States

### Loading Indicators
- **General Loading**: Data fetching
- **Update Loading**: Form submissions
- **Delete Loading**: Item deletions

### UI Feedback
- Spinner animations
- Disabled buttons during operations
- Loading text indicators

## Best Practices

### 1. Use the Custom Hook
Always use `useFooterRedux` instead of direct Redux calls:

```tsx
// ✅ Good
const { updateGeneralInfo } = useFooterRedux();

// ❌ Avoid
const dispatch = useAppDispatch();
dispatch(updateGeneralInfo(data));
```

### 2. Handle Loading States
Always show loading indicators:

```tsx
const { updating } = useFooterRedux();

<Button disabled={updating}>
  {updating ? 'Saving...' : 'Save'}
</Button>
```

### 3. Error Handling
Handle errors gracefully:

```tsx
const { error, updateError } = useFooterRedux();

{error && <div className="error">{error}</div>}
{updateError && <div className="error">{updateError}</div>}
```

### 4. Modal Management
Use Redux for modal state:

```tsx
const { 
  isGeneralModalOpen, 
  openGeneralModal, 
  closeGeneralModal 
} = useFooterRedux();

<Dialog open={isGeneralModalOpen} onOpenChange={closeGeneralModal}>
  {/* Modal content */}
</Dialog>
```

## Testing

### Example Component
Use `FooterReduxExample` component for testing:

```tsx
import { FooterReduxExample } from '@/components/examples/footer-redux-example';

function TestPage() {
  return <FooterReduxExample />;
}
```

### Test Features
- Data loading and display
- Update operations
- Error handling
- Loading states
- Modal management

## Migration from Service-Based Approach

### Before (Service-Based)
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleUpdate = async (data) => {
  setLoading(true);
  try {
    const response = await FooterService.update(data);
    if (response.success) {
      toast.success('Updated successfully');
    } else {
      setError(response.message);
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### After (Redux-Based)
```tsx
const { updateGeneralInfo, updating, error } = useFooterRedux();

const handleUpdate = async (data) => {
  await updateGeneralInfo(data); // Handles loading, errors, and success
};
```

## Conclusion

The Redux integration provides a robust, type-safe, and performant solution for footer management. It simplifies state management, improves user experience, and provides better error handling and loading states.

For more examples and advanced usage, see the `FooterReduxExample` component and the `useFooterRedux` hook implementation.
