# Redux RTK Query Product API Guide

This guide shows how to use Redux RTK Query hooks for product operations instead of direct fetch calls.

## Available Hooks

### 1. Get All Products
```typescript
import { useGetProductsQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error, refetch } = useGetProductsQuery({ page: 1, limit: 10 });
```

### 2. Get Single Product
```typescript
import { useGetSingleProductQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error } = useGetSingleProductQuery(productId, {
  skip: !productId // Skip query if no productId
});
```

### 3. Create Product
```typescript
import { useCreateProductMutation } from '@/lib/features/products/productApi';

const [createProduct, { isLoading, error, isSuccess }] = useCreateProductMutation();
```

### 4. Update Product
```typescript
import { useUpdateProductMutation } from '@/lib/features/products/productApi';

const [updateProduct, { isLoading, error, isSuccess }] = useUpdateProductMutation();
```

### 5. Delete Product
```typescript
import { useDeleteProductMutation } from '@/lib/features/products/productApi';

const [deleteProduct, { isLoading, error, isSuccess }] = useDeleteProductMutation();
```

### 6. Get Products by Category
```typescript
import { useGetProductsByCategoryQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error } = useGetProductsByCategoryQuery({ 
  categoryId: 'category-id',
  filters: { page: 1, limit: 10 }
});
```

### 7. Get New Arrivals
```typescript
import { useGetNewArrivalsQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error } = useGetNewArrivalsQuery({ limit: 10 });
```

### 8. Get Top Selling Products
```typescript
import { useGetTopSellingProductsQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error } = useGetTopSellingProductsQuery({ limit: 10 });
```

### 9. Get Related Products
```typescript
import { useGetRelatedProductsQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error } = useGetRelatedProductsQuery(productId);
```

### 10. Get Product Analytics
```typescript
import { useGetProductAnalyticsQuery } from '@/lib/features/products/productApi';

const { data, isLoading, error } = useGetProductAnalyticsQuery();
```

## Usage Examples

### Fetching Products

```typescript
"use client";

import React from 'react';
import { useGetProductsQuery } from '@/lib/features/products/productApi';

export default function ProductsList() {
  const { data, isLoading, error, refetch } = useGetProductsQuery({ 
    page: 1, 
    limit: 10 
  });

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh Products</button>
      {data?.data?.map(product => (
        <div key={product._id || product.id}>
          <h3>{product.title}</h3>
          <p>${product.regularPrice}</p>
        </div>
      ))}
    </div>
  );
}
```

### Getting Single Product (Edit Page)

```typescript
"use client";

import React, { useMemo } from 'react';
import { useGetSingleProductQuery } from '@/lib/features/products/productApi';

export default function EditProductPage({ productId }: { productId: string }) {
  const { 
    data: productData, 
    isLoading, 
    error, 
    isError 
  } = useGetSingleProductQuery(productId, {
    skip: !productId
  });

  // Transform API data to form initial values
  const product = useMemo(() => {
    if (!productData?.data) return null;
    
    const data = productData.data as any; // Type assertion for API response
    return {
      title: data.title || "",
      sku: data.sku || "",
      primaryImage: data.primaryImage || "",
      optionalImage: data.optionalImages || [],
      regularPrice: data.regularPrice || 0,
      discountedPrice: data.discountPrice || 0,
      videoLink: data.videoLink || "",
      category: Array.isArray(data.catagory) && data.catagory.length > 0 ? data.catagory[0]._id : "",
      description: data.description || "",
      color: data.color || data.variants?.color || [],
      size: data.size || data.variants?.size || [],
    };
  }, [productData]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message || 'Failed to load product'}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      {/* Your product form with initialValues={product} */}
    </div>
  );
}
```

### Creating a Product

```typescript
"use client";

import React, { useState } from 'react';
import { useCreateProductMutation } from '@/lib/features/products/productApi';

export default function CreateProductForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    regularPrice: 0,
    discountPrice: 0,
    primaryImage: '',
  });

  const [createProduct, { isLoading, error, isSuccess }] = useCreateProductMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createProduct({
        title: formData.title,
        description: formData.description,
        regularPrice: formData.regularPrice,
        discountPrice: formData.discountPrice,
        primaryImage: formData.primaryImage,
        catagory: [], // Add category selection logic
        optionalImages: [],
        variants: {
          color: [],
          size: []
        }
      }).unwrap();

      if (result.success) {
        console.log('Product created:', result.data);
        // Reset form or redirect
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

### Updating a Product

```typescript
"use client";

import React from 'react';
import { useUpdateProductMutation } from '@/lib/features/products/productApi';

export default function UpdateProductForm({ productId }: { productId: string }) {
  const [updateProduct, { isLoading, error, isSuccess }] = useUpdateProductMutation();

  const handleUpdate = async (formData: any) => {
    try {
      const result = await updateProduct({
        id: productId,
        data: {
          title: formData.title,
          description: formData.description,
          regularPrice: formData.regularPrice,
          discountPrice: formData.discountPrice,
        }
      }).unwrap();

      if (result.success) {
        console.log('Product updated:', result.data);
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  return (
    <button onClick={() => handleUpdate(formData)} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Update Product'}
    </button>
  );
}
```

### Deleting a Product

```typescript
"use client";

import React from 'react';
import { useDeleteProductMutation } from '@/lib/features/products/productApi';

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [deleteProduct, { isLoading, error, isSuccess }] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const result = await deleteProduct(productId).unwrap();
        
        if (result.success) {
          console.log('Product deleted successfully');
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete Product'}
    </button>
  );
}
```

## Data Types

### Product Interface
```typescript
interface Product {
  discountPrice: number;
  regularPrice: number;
  catagory: any;
  description: string;
  id: number;
  title: string;
  primaryImage: string;
  optionalImages: string[];
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
  variants: Variants;
}
```

### Product Response Interfaces
```typescript
interface ProductResponse {
  data: Product[];
  message: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ProductSingleResponse {
  data: Product;
  message: string;
  success: boolean;
}
```

## Benefits of Using Redux RTK Query

1. **Automatic Caching**: Products are automatically cached and shared across components
2. **Background Refetching**: Data is automatically refetched when needed
3. **Optimistic Updates**: UI updates immediately while the request is in progress
4. **Error Handling**: Built-in error handling and retry logic
5. **Loading States**: Automatic loading state management
6. **Cache Invalidation**: Automatic cache invalidation when data changes
7. **TypeScript Support**: Full TypeScript support with type inference
8. **Pagination Support**: Built-in pagination handling
9. **Filtering**: Advanced filtering capabilities
10. **Analytics**: Built-in analytics queries

## Migration from Direct Fetch

### Before (Direct Fetch)
```typescript
const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      setProduct(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchProduct();
}, [productId]);
```

### After (Redux RTK Query)
```typescript
const { data: productData, isLoading, error } = useGetSingleProductQuery(productId, {
  skip: !productId
});

const product = productData?.data;
```

## Store Configuration

The products API is already configured in the Redux store. Make sure your store includes the products reducer and API slice:

```typescript
// In store.ts
import { productsReducer } from './features/products/productsSlice';
import { apiSlice } from './features/api/apiSlice';

const rootReducer = combineReducers({
  // ... other reducers
  products: productsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer
});
```

## Example Component

See `front-end/src/components/examples/product-redux-example.tsx` for a complete working example of how to use the Redux RTK Query hooks for product operations.

## Common Patterns

### Conditional Queries
```typescript
// Skip query if condition is not met
const { data } = useGetSingleProductQuery(productId, {
  skip: !productId || !isAuthenticated
});
```

### Refetching Data
```typescript
const { data, refetch } = useGetProductsQuery({ page: 1, limit: 10 });

// Manually refetch
const handleRefresh = () => {
  refetch();
};
```

### Error Handling
```typescript
const { data, error, isError } = useGetProductsQuery({ page: 1, limit: 10 });

if (isError) {
  const errorMessage = error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data 
    ? (error.data as { message: string }).message 
    : 'Failed to load products';
  
  return <div>Error: {errorMessage}</div>;
}
```

### Loading States
```typescript
const { data, isLoading, isFetching } = useGetProductsQuery({ page: 1, limit: 10 });

// isLoading: true only on first load
// isFetching: true on every fetch (including background refetches)
```
