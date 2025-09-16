# Permission Management System

A comprehensive role-based access control (RBAC) system for the ecommerce application built with Redux Toolkit and TypeScript.

## Features

- **Role-Based Access Control (RBAC)**: Define roles and assign permissions to them
- **Resource-Based Permissions**: Control access to specific resources (users, products, orders, etc.)
- **Action-Based Permissions**: Control specific actions (create, read, update, delete)
- **User Role Assignment**: Assign multiple roles to users
- **Permission Caching**: Efficient permission checking with caching
- **Component-Level Protection**: Easy-to-use components for permission-based rendering
- **Route-Level Protection**: Middleware for protecting entire routes
- **Redux Integration**: Full Redux state management for permissions

## Architecture

### Backend Integration

The frontend integrates with the backend permission system through:

- **Permission API**: RESTful API endpoints for permission management
- **Current User Permissions**: Endpoints for getting current user's permissions
- **Permission Checking**: Real-time permission validation

### Frontend Structure

```
src/lib/features/permissions/
├── index.ts                    # Main exports
├── permissionApi.ts           # RTK Query API slice
├── permissionSlice.ts         # Redux slice for state management
├── permissionUtils.ts         # Utility functions
├── usePermissions.ts          # Custom hooks
└── README.md                  # This file
```

## Usage

### 1. Basic Permission Checking

```tsx
import { useHasPermission } from '@/lib/features/permissions';

function MyComponent() {
  const { hasPermission, isLoading } = useHasPermission('products', 'create');
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {hasPermission ? (
        <button>Create Product</button>
      ) : (
        <p>You don't have permission to create products</p>
      )}
    </div>
  );
}
```

### 2. Component-Level Protection

```tsx
import { PermissionGate } from '@/components/common/PermissionGate';

function AdminPanel() {
  return (
    <PermissionGate resource="users" action="read" fallback={<div>Access Denied</div>}>
      <UserManagement />
    </PermissionGate>
  );
}
```

### 3. Multiple Permission Checks

```tsx
import { useHasAnyPermission, useHasAllPermissions } from '@/lib/features/permissions';

function ComplexComponent() {
  // Check if user has ANY of these permissions
  const { hasPermission: canManageProducts } = useHasAnyPermission([
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'delete' }
  ]);
  
  // Check if user has ALL of these permissions
  const { hasPermission: canFullyManageUsers } = useHasAllPermissions([
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' }
  ]);
  
  return (
    <div>
      {canManageProducts && <ProductManagement />}
      {canFullyManageUsers && <UserManagement />}
    </div>
  );
}
```

### 4. Route-Level Protection

```tsx
// In your page component
import { withPermissionRoute } from '@/components/common/PermissionMiddleware';

const AdminOrdersPage = () => {
  return <OrdersManagement />;
};

export default withPermissionRoute(AdminOrdersPage, [
  { resource: 'orders', action: 'read' }
]);
```

### 5. Permission Management (Admin Only)

```tsx
import { PermissionManagement } from '@/components/admin/PermissionManagement';

function AdminPermissionsPage() {
  return (
    <PermissionGate resource="users" action="read">
      <PermissionManagement />
    </PermissionGate>
  );
}
```

## API Integration

### Available Hooks

- `useCurrentUserPermissions()` - Get current user's permissions
- `useHasPermission(resource, action)` - Check single permission
- `useHasAnyPermission(permissions)` - Check if user has any permission
- `useHasAllPermissions(permissions)` - Check if user has all permissions
- `useCheckPermission()` - Check permission with caching
- `usePermissionGate(resource, action, fallback)` - Component-level protection
- `useIsAdmin()` - Check if user is admin
- `useIsManager()` - Check if user is manager
- `useIsViewer()` - Check if user is viewer

### Available Mutations

- `useCreatePermissionMutation()`
- `useUpdatePermissionMutation()`
- `useDeletePermissionMutation()`
- `useCreateRoleMutation()`
- `useUpdateRoleMutation()`
- `useDeleteRoleMutation()`
- `useAssignRoleToUserMutation()`
- `useRemoveRoleFromUserMutation()`

## Permission Resources

The system supports the following resources:

- `users` - User management
- `products` - Product management
- `categories` - Category management
- `orders` - Order management
- `coupons` - Coupon management
- `content` - Content management
- `reports` - Report management
- `company-settings` - Company settings
- `shipping-addresses` - Shipping address management

## Permission Actions

Each resource supports these actions:

- `create` - Create new records
- `read` - View/read records
- `update` - Modify existing records
- `delete` - Remove records

## Utility Functions

```tsx
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  getPermissionsForResource,
  isAdmin,
  isManager,
  isViewer,
  createPermissionKey
} from '@/lib/features/permissions';
```

## State Management

The permission state is managed through Redux and includes:

- Current user permissions and roles
- All permissions and roles (for admin management)
- Loading and error states
- UI state for modals and selections
- Permission cache for performance

## Middleware Integration

The system includes middleware for:

- Route-level permission checking
- Automatic redirects for unauthorized access
- Token validation and user authentication
- Permission-based route protection

## Best Practices

1. **Use Permission Gates**: Wrap components that require specific permissions
2. **Cache Permissions**: Use the built-in caching for better performance
3. **Handle Loading States**: Always handle loading states when checking permissions
4. **Provide Fallbacks**: Always provide fallback content for denied permissions
5. **Use Utility Functions**: Leverage utility functions for complex permission logic
6. **Test Permissions**: Test your permission logic thoroughly

## Error Handling

The system handles various error scenarios:

- Network errors when fetching permissions
- Invalid or expired tokens
- Missing permissions
- Server-side permission validation failures

## Performance Considerations

- Permissions are cached to avoid repeated API calls
- Permission checks are optimized for performance
- Redux state is normalized for efficient updates
- Lazy loading of permission data

## Security

- All permission checks are validated on both client and server
- Tokens are securely stored and validated
- Permission data is not persisted in localStorage for security
- Server-side validation ensures data integrity
