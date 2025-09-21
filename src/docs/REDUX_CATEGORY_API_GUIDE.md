# Redux RTK Query Category API Guide

This guide shows how to use Redux RTK Query hooks for category operations instead of server actions.

## Available Hooks

### 1. Create Category
```typescript
import { useCreateCategoryMutation } from '@/lib/features/categories';

const [createCategory, { isLoading, error, isSuccess, data }] = useCreateCategoryMutation();
```

### 2. Get All Categories
```typescript
import { useGetCategoriesQuery } from '@/lib/features/categories';

const { data, isLoading, error, refetch } = useGetCategoriesQuery();
```

### 3. Get Single Category
```typescript
import { useGetCategoryByIdQuery } from '@/lib/features/categories';

const { data, isLoading, error } = useGetCategoryByIdQuery(categoryId);
```

### 4. Update Category
```typescript
import { useUpdateCategoryMutation } from '@/lib/features/categories';

const [updateCategory, { isLoading, error, isSuccess }] = useUpdateCategoryMutation();
```

### 5. Delete Category
```typescript
import { useDeleteCategoryMutation } from '@/lib/features/categories';

const [deleteCategory, { isLoading, error, isSuccess }] = useDeleteCategoryMutation();
```

### 6. Bulk Delete Categories
```typescript
import { useBulkDeleteCategoriesMutation } from '@/lib/features/categories';

const [bulkDeleteCategories, { isLoading, error, isSuccess }] = useBulkDeleteCategoriesMutation();
```

### 7. Get Products by Category
```typescript
import { useGetProductsByCategoryQuery } from '@/lib/features/categories';

const { data, isLoading, error } = useGetProductsByCategoryQuery(categoryId);
```

## Usage Examples

### Creating a Category

```typescript
"use client";

import React, { useState } from 'react';
import { useCreateCategoryMutation } from '@/lib/features/categories';

export default function CreateCategoryForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    parent: null as string | null,
  });

  const [createCategory, { isLoading, error, isSuccess }] = useCreateCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createCategory({
        title: formData.title,
        description: formData.description,
        parent: formData.parent,
      }).unwrap();

      if (result.success) {
        console.log('Category created:', result.data);
        // Reset form or show success message
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Category'}
      </button>
    </form>
  );
}
```

### Fetching Categories

```typescript
"use client";

import React from 'react';
import { useGetCategoriesQuery } from '@/lib/features/categories';

export default function CategoriesList() {
  const { data, isLoading, error, refetch } = useGetCategoriesQuery();

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh Categories</button>
      {data?.data?.map(category => (
        <div key={category._id}>
          <h3>{category.title}</h3>
          <p>{category.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Updating a Category

```typescript
"use client";

import React from 'react';
import { useUpdateCategoryMutation } from '@/lib/features/categories';

export default function UpdateCategoryForm({ categoryId }: { categoryId: string }) {
  const [updateCategory, { isLoading, error, isSuccess }] = useUpdateCategoryMutation();

  const handleUpdate = async () => {
    try {
      const result = await updateCategory({
        id: categoryId,
        data: {
          title: 'Updated Title',
          description: 'Updated Description',
          parent: null,
        }
      }).unwrap();

      if (result.success) {
        console.log('Category updated:', result.data);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Update Category'}
    </button>
  );
}
```

### Deleting a Category

```typescript
"use client";

import React from 'react';
import { useDeleteCategoryMutation } from '@/lib/features/categories';

export default function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [deleteCategory, { isLoading, error, isSuccess }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const result = await deleteCategory(categoryId).unwrap();
        
        if (result.success) {
          console.log('Category deleted successfully');
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete Category'}
    </button>
  );
}
```

## Data Types

### CategoryData Interface
```typescript
interface CategoryData {
  _id: string;
  title: string;
  description: string;
  parent: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  productCount?: number;
}
```

### CreateCategoryData Interface
```typescript
interface CreateCategoryData {
  title: string;
  description: string;
  parent?: string | null;
}
```

### UpdateCategoryData Interface
```typescript
interface UpdateCategoryData {
  title?: string;
  description?: string;
  parent?: string | null;
}
```

## Benefits of Using Redux RTK Query

1. **Automatic Caching**: Categories are automatically cached and shared across components
2. **Background Refetching**: Data is automatically refetched when needed
3. **Optimistic Updates**: UI updates immediately while the request is in progress
4. **Error Handling**: Built-in error handling and retry logic
5. **Loading States**: Automatic loading state management
6. **Cache Invalidation**: Automatic cache invalidation when data changes
7. **TypeScript Support**: Full TypeScript support with type inference

## Migration from Server Actions

### Before (Server Actions)
```typescript
import { createCategory } from '@/actions/category';

const handleSubmit = async (formData) => {
  const result = await createCategory(formData);
  if (result.success) {
    // Handle success
  }
};
```

### After (Redux RTK Query)
```typescript
import { useCreateCategoryMutation } from '@/lib/features/categories';

const [createCategory, { isLoading, error, isSuccess }] = useCreateCategoryMutation();

const handleSubmit = async (formData) => {
  try {
    const result = await createCategory(formData).unwrap();
    if (result.success) {
      // Handle success
    }
  } catch (error) {
    // Handle error
  }
};
```

## Store Configuration

The categories API is already configured in the Redux store. Make sure your store includes the categories reducer and API slice:

```typescript
// In store.ts
import { categoriesReducer } from './features/categories';
import { apiSlice } from './features/api/apiSlice';

const rootReducer = combineReducers({
  // ... other reducers
  categories: categoriesReducer,
  [apiSlice.reducerPath]: apiSlice.reducer
});
```

## Example Component

See `front-end/src/components/examples/category-create-example.tsx` for a complete working example of how to use the Redux RTK Query hooks for category operations.
