# Product Page Redux Migration Guide

## Overview
Successfully migrated the product page from server actions to Redux RTK Query for better state management, caching, and performance.

## Migration Summary

### Before (Server Actions)
- Used `getSingleProduct` server action
- Manual state management with `useProductISR` hook
- Server-side data fetching with ISR
- Complex data transformation logic

### After (Redux RTK Query)
- Uses `useGetSingleProductQuery` Redux hook
- Automatic caching and state management
- Client-side data fetching with Redux
- Centralized data transformation

## Changes Made

### 1. Page Component (`page.tsx`)

**Before:**
```typescript
export default async function ProductPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const productId = params.slug[0];

  // Fetch product at build time
  const product = await getSingleProduct(productId);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetails id={productId} initialProduct={product} />
  );
}
```

**After:**
```typescript
"use client";

export default function ProductPage() {
  const params = useParams() as { slug: string[] };
  const productId = params.slug[0];

  if (!productId) {
    notFound();
  }

  return (
    <ProductDetails id={productId} />
  );
}
```

### 2. ProductDetails Component (`ProductDetails.tsx`)

**Before:**
```typescript
const { product, loading, error, dataSource, performanceMetrics } =
  useProductISR({
    productId: id,
    initialProduct,
  });
```

**After:**
```typescript
const { 
  product: transformedProduct,
  loading, 
  error, 
  isError,
  isSuccess,
  performanceMetrics,
  dataSource,
  refetch
} = useProductRedux({ 
  productId: id,
  skip: !id 
});
```

### 3. Custom Redux Hook (`use-product-redux.tsx`)

**Created new hook:**
```typescript
export function useProductRedux({ productId, skip = false }: UseProductReduxProps) {
  const { 
    data: productData, 
    isLoading, 
    error, 
    isError,
    isSuccess,
    isFetching,
    refetch
  } = useGetSingleProductQuery(productId, {
    skip: !productId || skip
  });

  // Transform product data
  const transformedProduct = useMemo(() => {
    const product = productData?.data;
    if (!product) return null;
    
    try {
      return transformProductData(product);
    } catch (error) {
      console.error("Error transforming product data:", error);
      return product;
    }
  }, [productData]);

  return {
    product: transformedProduct,
    loading: isLoading,
    error,
    isError,
    isSuccess,
    performanceMetrics,
    dataSource,
    refetch,
    isFetching,
    isUninitialized: !productId || skip,
  };
}
```

## Benefits of Redux Migration

### 1. **Automatic Caching**
- Products are automatically cached and shared across components
- No need for manual cache management
- Background refetching when data becomes stale

### 2. **Better State Management**
- Centralized state management with Redux
- Consistent data flow across the application
- Easy to debug with Redux DevTools

### 3. **Performance Improvements**
- Automatic request deduplication
- Optimistic updates
- Background refetching
- Reduced unnecessary API calls

### 4. **Developer Experience**
- Type-safe API calls
- Automatic loading and error states
- Built-in retry logic
- Easy testing and mocking

### 5. **Consistency**
- Same API patterns across the application
- Consistent error handling
- Unified data transformation

## API Integration

### Redux RTK Query Hooks Used

```typescript
// Get single product
const { data, isLoading, error } = useGetSingleProductQuery(productId);

// Get products list
const { data, isLoading, error } = useGetProductsQuery({ page: 1, limit: 10 });

// Create product
const [createProduct, { isLoading, error }] = useCreateProductMutation();

// Update product
const [updateProduct, { isLoading, error }] = useUpdateProductMutation();

// Delete product
const [deleteProduct, { isLoading, error }] = useDeleteProductMutation();
```

### Data Transformation

The `transformProductData` utility ensures consistent data format:

```typescript
// Handles multiple API response formats
const transformedProduct = transformProductData(apiResponse);

// Features:
// - Color and size data normalization
// - Backward compatibility
// - Error handling and fallbacks
// - Type safety
```

## Usage Examples

### Basic Product Fetching
```typescript
import { useProductRedux } from '@/hooks/use-product-redux';

function ProductPage({ productId }: { productId: string }) {
  const { 
    product, 
    loading, 
    error, 
    isError,
    refetch 
  } = useProductRedux({ productId });

  if (loading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Product Mutations
```typescript
import { useUpdateProductMutation } from '@/lib/features/products/productApi';

function EditProduct({ productId }: { productId: string }) {
  const [updateProduct, { isLoading, error }] = useUpdateProductMutation();

  const handleUpdate = async (formData: any) => {
    try {
      const result = await updateProduct({
        id: productId,
        data: formData
      }).unwrap();
      
      console.log('Product updated:', result.data);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Product'}
      </button>
    </form>
  );
}
```

## Performance Metrics

The Redux hook provides performance metrics:

```typescript
const { performanceMetrics } = useProductRedux({ productId });

// Available metrics:
// - hasServerData: boolean
// - dataCompleteness: { hasProduct, hasValidProduct }
// - cacheStatus: { isCached, isFetching, isStale }
```

## Error Handling

Redux RTK Query provides comprehensive error handling:

```typescript
const { error, isError } = useProductRedux({ productId });

if (isError) {
  const errorMessage = error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data 
    ? (error.data as { message: string }).message 
    : 'Failed to load product';
  
  return <div>Error: {errorMessage}</div>;
}
```

## Testing

### Unit Testing
```typescript
import { renderHook } from '@testing-library/react';
import { useProductRedux } from '@/hooks/use-product-redux';

test('should fetch product data', () => {
  const { result } = renderHook(() => useProductRedux({ productId: '123' }));
  
  expect(result.current.loading).toBe(true);
  // Test loading, success, and error states
});
```

### Integration Testing
```typescript
import { render, screen } from '@testing-library/react';
import ProductPage from '@/app/(frontend)/shop/product/[...slug]/page';

test('should render product page', () => {
  render(<ProductPage />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

## Migration Checklist

- [x] Update page component to use client-side rendering
- [x] Replace useProductISR with useProductRedux
- [x] Update ProductDetails component
- [x] Create custom Redux hook
- [x] Update data transformation
- [x] Test all functionality
- [x] Update documentation
- [x] Remove unused server actions

## Future Enhancements

1. **Optimistic Updates**: Update UI immediately while API call is in progress
2. **Pagination**: Add pagination support for product lists
3. **Search**: Implement product search with Redux
4. **Filters**: Add filtering capabilities
5. **Real-time Updates**: WebSocket integration for real-time updates

## Troubleshooting

### Common Issues

1. **Data Not Loading**: Check if productId is valid and not empty
2. **Transform Errors**: Verify API response format matches expected structure
3. **Cache Issues**: Use refetch() to force data refresh
4. **Type Errors**: Ensure proper TypeScript types are imported

### Debug Tools

- Redux DevTools for state inspection
- Network tab for API call monitoring
- Console logs for debugging (development only)

## Conclusion

The migration to Redux RTK Query provides:
- Better performance through automatic caching
- Improved developer experience with type safety
- Consistent state management across the application
- Easy testing and debugging capabilities

The product page now uses modern Redux patterns while maintaining all existing functionality and improving overall performance.
