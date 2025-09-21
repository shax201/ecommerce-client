# Navbar Redux Feature

This feature provides comprehensive Redux integration for navbar management with ISR (Incremental Static Regeneration) support.

## Features

- **Redux State Management**: Centralized state management for navbar data, menus, and logo
- **RTK Query Integration**: Automatic caching and synchronization with backend APIs
- **ISR Support**: Server-side rendering with client-side hydration
- **Performance Optimization**: Memoized selectors and efficient re-renders
- **Error Handling**: Comprehensive error states and recovery mechanisms
- **Type Safety**: Full TypeScript support with proper type definitions

## Files Structure

```
navbar/
├── navbarApi.ts          # RTK Query API endpoints
├── navbarSlice.ts        # Redux slice with actions and reducers
├── index.ts             # Exports
└── README.md            # Documentation
```

## Usage

### 1. Basic Usage in Components

```tsx
import { useNavbarRedux } from "@/hooks/use-navbar-redux";

function MyComponent() {
  const {
    navbarData,
    menus,
    logo,
    isLoading,
    error,
    dataSource,
    refreshNavbar,
    performanceMetrics,
  } = useNavbarRedux({
    // Optional: Pass server-side data for ISR
    dynamicMenus: serverMenus,
    logo: serverLogo,
    navbarData: serverNavbarData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {logo && <img src={logo.url} alt={logo.altText} />}
      {menus.map(menu => (
        <div key={menu.id}>{menu.label}</div>
      ))}
    </div>
  );
}
```

### 2. Direct Redux Usage

```tsx
import { useDispatch, useSelector } from "react-redux";
import { 
  setNavbarData, 
  setMenus, 
  setLogo,
  selectNavbarData,
  selectMenus,
  selectLogo 
} from "@/lib/features/navbar";

function MyComponent() {
  const dispatch = useDispatch();
  const navbarData = useSelector(selectNavbarData);
  const menus = useSelector(selectMenus);
  const logo = useSelector(selectLogo);

  const handleRefresh = () => {
    dispatch(setNavbarData(newData));
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### 3. RTK Query Hooks

```tsx
import { 
  useGetNavbarQuery,
  useUpdateNavbarMutation,
  useAddNavbarMenuMutation 
} from "@/lib/features/navbar";

function NavbarManager() {
  const { data: navbar, isLoading, error } = useGetNavbarQuery();
  const [updateNavbar] = useUpdateNavbarMutation();
  const [addMenu] = useAddNavbarMenuMutation();

  const handleUpdate = async (data) => {
    try {
      await updateNavbar(data).unwrap();
      console.log("Navbar updated successfully");
    } catch (error) {
      console.error("Failed to update navbar:", error);
    }
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

## API Endpoints

### Navbar Management
- `getNavbar()` - Get navbar data
- `updateNavbar(data)` - Update navbar configuration
- `addNavbarMenu(data)` - Add new menu
- `updateNavbarMenu({ menuId, data })` - Update menu
- `deleteNavbarMenu(menuId)` - Delete menu

### Menu Items
- `addNavbarMenuItem({ menuId, data })` - Add menu item
- `updateNavbarMenuItem({ menuId, itemId, data })` - Update menu item
- `deleteNavbarMenuItem({ menuId, itemId })` - Delete menu item

### Reordering
- `reorderNavbarMenus(updates)` - Reorder menus
- `reorderNavbarMenuItems({ menuId, updates })` - Reorder menu items

### Bulk Operations
- `bulkActivateNavbarMenus(menuIds)` - Activate multiple menus
- `bulkDeactivateNavbarMenus(menuIds)` - Deactivate multiple menus
- `bulkDeleteNavbarMenus(menuIds)` - Delete multiple menus

## State Structure

```typescript
interface NavbarState {
  // Data
  navbarData: NavbarData | null;
  menus: NavbarMenu[];
  logo: LogoData | null;

  // Loading states
  isLoading: boolean;
  isMenuLoading: boolean;
  isLogoLoading: boolean;

  // Error states
  error: string | null;
  menuError: string | null;
  logoError: string | null;

  // UI states
  isMenuOpen: boolean;
  activeMenuId: number | null;

  // Performance metrics
  lastFetched: number | null;
  dataSource: DataSourceInfo;

  // Cache management
  cache: CacheData;
}
```

## ISR Integration

The navbar feature supports ISR (Incremental Static Regeneration) for optimal performance:

1. **Server-side**: Data is fetched during build time or on-demand
2. **Client-side**: Data is hydrated and can be updated
3. **Hybrid**: Combines server and client data for best performance

```tsx
// Server-side (in getServerSideProps or getStaticProps)
const navbarData = await getNavbarISR();
const dynamicMenus = await getActiveDynamicMenusISR();
const logo = await getActiveLogoISR();

// Client-side (in component)
const navbar = useNavbarRedux({
  navbarData: navbarData.data,
  dynamicMenus: dynamicMenus.data,
  logo: logo.data,
});
```

## Performance Features

- **Memoized Selectors**: Prevents unnecessary re-renders
- **Efficient Caching**: RTK Query handles caching automatically
- **Data Source Tracking**: Knows whether data comes from server or client
- **Performance Metrics**: Built-in performance monitoring
- **Error Recovery**: Automatic retry and fallback mechanisms

## Error Handling

The feature provides comprehensive error handling:

```tsx
const {
  error,
  menuError,
  logoError,
  clearAllErrors,
} = useNavbarRedux();

// Clear all errors
clearAllErrors();

// Handle specific errors
if (error) {
  console.error("Navbar error:", error);
}
```

## TypeScript Support

Full TypeScript support with proper type definitions:

```typescript
import type { 
  NavbarData, 
  NavbarMenu, 
  NavbarMenuItem,
  NavbarState 
} from "@/lib/features/navbar";
```

## Best Practices

1. **Use the custom hook**: Prefer `useNavbarRedux` over direct Redux usage
2. **Pass server data**: Always pass server-side data for ISR when available
3. **Handle loading states**: Always show loading indicators
4. **Error boundaries**: Wrap components in error boundaries
5. **Performance monitoring**: Use the built-in performance metrics
6. **Type safety**: Always use TypeScript for better development experience

## Migration from use-navbar-isr

If you're migrating from the old `use-navbar-isr` hook:

```tsx
// Old way
const { menusData, logoData, isLoading, hasError } = useNavbarISR({
  dynamicMenus,
  logo,
});

// New way
const { menus, logo, isLoading, error } = useNavbarRedux({
  dynamicMenus,
  logo,
});
```

The new hook provides the same functionality with better state management and performance.
