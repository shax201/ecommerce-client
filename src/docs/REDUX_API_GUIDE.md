# Redux API Integration Guide

This guide demonstrates how to call APIs using Redux with RTK Query in your ecommerce project.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [API Slices](#api-slices)
4. [Redux Slices](#redux-slices)
5. [Custom Hooks](#custom-hooks)
6. [Component Usage](#component-usage)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

## Overview

This project uses Redux Toolkit with RTK Query for API management. The architecture includes:

- **API Slices**: Define API endpoints using RTK Query
- **Redux Slices**: Manage local state and UI state
- **Custom Hooks**: Provide easy-to-use interfaces for components
- **Components**: Use hooks to interact with APIs and state

## Setup

### 1. Store Configuration

The Redux store is configured in `src/lib/store.ts`:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./features/api/apiSlice";
import productsReducer from "./features/products/productsSlice";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      products: productsReducer,
      [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
  return store;
};
```

### 2. Provider Setup

Wrap your app with the Redux provider:

```typescript
// app/providers.tsx
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";

const store = makeStore().store;

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
```

## API Slices

### Products API Slice

Located in `src/lib/features/products/productApi.ts`, this defines all product-related API endpoints:

```typescript
export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with filters
    getProducts: builder.query<ProductResponse, ProductFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        // Build query parameters from filters
        return {
          url: `/products?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get single product
    getSingleProduct: builder.query<ProductSingleResponse, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Mutations
    createProductReview: builder.mutation<{ success: boolean; message: string }, {
      productId: string;
      rating: number;
      title: string;
      comment: string;
    }>({
      query: (reviewData) => ({
        url: `/products/reviews`,
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: `REVIEWS_${productId}` },
        { type: 'Product', id: productId },
      ],
    }),
  }),
});
```

### Key Features

- **Automatic Caching**: RTK Query automatically caches responses
- **Background Refetching**: Data is refetched when stale
- **Optimistic Updates**: Mutations can update cache immediately
- **Tag-based Invalidation**: Related data is invalidated when mutations occur

## Redux Slices

### Products Slice

Located in `src/lib/features/products/productsSlice.ts`, manages local state:

```typescript
export const productsSlice = createSlice({
  name: "products",
  initialState: {
    // UI State
    colorSelection: { name: "Brown", code: "bg-[#4F4631]" },
    sizeSelection: "Large",
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    
    // Product Data
    products: [],
    filteredProducts: [],
    
    // Current filters
    currentFilters: {},
    
    // Pagination
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  },
  reducers: {
    // UI State Actions
    setColorSelection: (state, action) => {
      state.colorSelection = action.payload;
    },
    
    // Filter Actions
    updateFilters: (state, action) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.currentFilters = {};
      state.minPrice = 0;
      state.maxPrice = 10000;
      state.category = "";
    },
  },
});
```

## Custom Hooks

### useReduxProducts Hook

Located in `src/hooks/useReduxProducts.tsx`, provides a comprehensive interface:

```typescript
export function useReduxProducts() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const currentFilters = useSelector(selectCurrentFilters);
  const pagination = useSelector(selectPagination);
  
  // API queries
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useGetProductsQuery(currentFilters);
  
  // API mutations
  const [addToWishlist] = useAddToWishlistMutation();
  const [createReview] = useCreateProductReviewMutation();
  
  // Computed values
  const products = productsData?.data || [];
  const isLoading = isLoadingProducts;
  
  // Actions
  const updateSearch = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(updateFilters({ search: query }));
  }, [dispatch]);
  
  const addProductToWishlist = useCallback(async (productId: string) => {
    try {
      await addToWishlist({ productId }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [addToWishlist]);
  
  return {
    // Data
    products,
    pagination,
    
    // Loading states
    isLoading,
    isError: !!productsError,
    
    // Actions
    updateSearch,
    addProductToWishlist,
    // ... more actions
  };
}
```

## Component Usage

### Basic Usage

```typescript
import { useReduxProducts } from "@/hooks/useReduxProducts";

export default function ProductList() {
  const {
    products,
    isLoading,
    isError,
    updateSearch,
    addProductToWishlist,
  } = useReduxProducts();
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading products</div>;
  
  return (
    <div>
      <input 
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="Search products..."
      />
      
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>${product.price}</p>
          <button onClick={() => addProductToWishlist(product.id)}>
            Add to Wishlist
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Usage with Filters

```typescript
export default function ShopPage() {
  const {
    products,
    pagination,
    isLoading,
    updatePriceRange,
    updateCategory,
    updateSorting,
    goToPage,
    clearAllFilters,
  } = useReduxProducts();
  
  const handlePriceFilter = (min: number, max: number) => {
    updatePriceRange(min, max);
  };
  
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateSorting(sortBy, sortOrder);
  };
  
  return (
    <div>
      {/* Filters */}
      <div>
        <button onClick={() => handlePriceFilter(0, 100)}>
          Under $100
        </button>
        <button onClick={() => handleSort('price', 'asc')}>
          Sort by Price
        </button>
        <button onClick={clearAllFilters}>
          Clear Filters
        </button>
      </div>
      
      {/* Products */}
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Pagination */}
      <div>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={page === pagination.currentPage ? 'active' : ''}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Use Custom Hooks

Instead of using Redux hooks directly in components, create custom hooks that encapsulate the logic:

```typescript
// ❌ Don't do this in components
const products = useSelector(selectProducts);
const dispatch = useDispatch();
const { data, isLoading } = useGetProductsQuery(filters);

// ✅ Do this instead
const { products, isLoading, updateFilters } = useReduxProducts();
```

### 2. Memoize Callbacks

Always memoize callback functions to prevent unnecessary re-renders:

```typescript
const handleUpdateFilters = useCallback((filters) => {
  dispatch(updateFilters(filters));
}, [dispatch]);
```

### 3. Handle Loading States

Always handle loading and error states:

```typescript
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;
```

### 4. Use TypeScript

Leverage TypeScript for better type safety:

```typescript
interface ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'popularity';
  minPrice?: number;
  maxPrice?: number;
}
```

### 5. Optimize Queries

Use query parameters efficiently and implement proper caching:

```typescript
// Use skip to conditionally run queries
const { data } = useGetSingleProductQuery(productId, {
  skip: !productId,
});

// Use selectFromResult to transform data
const { data: products } = useGetProductsQuery(filters, {
  selectFromResult: ({ data, ...other }) => ({
    ...other,
    data: data?.data || [],
  }),
});
```

## Examples

### Complete Product Management Component

```typescript
"use client";

import React, { useState } from "react";
import { useReduxProducts, useReduxSingleProduct } from "@/hooks/useReduxProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProductManagement() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  // Use the main products hook
  const {
    products,
    pagination,
    isLoading,
    isError,
    error,
    updateSearch,
    updatePriceRange,
    updateSorting,
    goToPage,
    addProductToWishlist,
    refreshProducts,
  } = useReduxProducts();

  // Use single product hook for details
  const {
    product,
    isLoading: isLoadingProduct,
    createProductReview,
    isCreatingReview,
  } = useReduxSingleProduct(selectedProductId);

  const handleSearch = (query: string) => {
    updateSearch(query);
  };

  const handlePriceFilter = (min: number, max: number) => {
    updatePriceRange(min, max);
  };

  const handleSort = (sortBy: string) => {
    updateSorting(sortBy, 'desc');
  };

  const handleAddToWishlist = async (productId: string) => {
    const result = await addProductToWishlist(productId);
    if (result.success) {
      alert("Added to wishlist!");
    } else {
      alert("Failed to add to wishlist");
    }
  };

  const handleCreateReview = async () => {
    if (!selectedProductId || !reviewData.title || !reviewData.comment) return;

    const result = await createProductReview(reviewData);
    if (result.success) {
      alert("Review created successfully!");
      setReviewData({ rating: 5, title: "", comment: "" });
    } else {
      alert("Failed to create review");
    }
  };

  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search products..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        <div className="flex gap-4">
          <Button onClick={() => handlePriceFilter(0, 100)}>
            Under $100
          </Button>
          <Button onClick={() => handleSort('price')}>
            Sort by Price
          </Button>
          <Button onClick={() => handleSort('rating')}>
            Sort by Rating
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">{product.title}</h3>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-sm text-gray-500 mb-4">{product.description}</p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setSelectedProductId(product.id)}
              >
                View Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddToWishlist(product.id)}
              >
                Add to Wishlist
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === pagination.currentPage ? "default" : "outline"}
              onClick={() => goToPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProductId && product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{product.title}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-xl font-semibold mb-4">${product.price}</p>
            
            {/* Review Form */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Add Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={reviewData.title}
                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                    placeholder="Review title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder="Your review comment"
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateReview}
                    disabled={isCreatingReview || !reviewData.title || !reviewData.comment}
                  >
                    {isCreatingReview ? "Creating..." : "Create Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProductId("")}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### API Error Handling

```typescript
const {
  data,
  error,
  isLoading,
  isError,
  isSuccess,
  isFetching,
} = useGetProductsQuery(filters);

// Handle different states
if (isLoading) return <LoadingSpinner />;
if (isError) {
  return (
    <ErrorMessage 
      message={error?.data?.message || error?.message || "Failed to load products"}
      onRetry={() => refetch()}
    />
  );
}
if (isSuccess && !data?.data?.length) {
  return <EmptyState message="No products found" />;
}
```

### Optimistic Updates

```typescript
const [addToWishlist, { isLoading }] = useAddToWishlistMutation();

const handleAddToWishlist = async (productId: string) => {
  try {
    // Optimistic update - update UI immediately
    dispatch(addToWishlistOptimistic(productId));
    
    // Make API call
    await addToWishlist({ productId }).unwrap();
    
    // Success - no need to update UI again
  } catch (error) {
    // Revert optimistic update on error
    dispatch(removeFromWishlistOptimistic(productId));
    alert("Failed to add to wishlist");
  }
};
```

## Conclusion

This Redux API integration provides:

- **Centralized State Management**: All product data and UI state in one place
- **Automatic Caching**: RTK Query handles caching and background updates
- **Type Safety**: Full TypeScript support throughout
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Error Handling**: Comprehensive error states and recovery
- **Performance**: Efficient re-renders and data fetching

The architecture is scalable and maintainable, making it easy to add new features and manage complex state interactions.
