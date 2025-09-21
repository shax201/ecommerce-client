import { apiSlice } from '../api/apiSlice';
import { CategoryData } from './categoriesSlice';

export interface CreateCategoryData {
  title: string;
  description: string;
  parent?: string | null;
}

export interface UpdateCategoryData {
  title?: string;
  description?: string;
  parent?: string | null;
}

export interface CategoriesResponse {
  success: boolean;
  data: CategoryData[];
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: CategoryData;
  message?: string;
}

export interface ProductsByCategoryResponse {
  success: boolean;
  data: any[];
  message?: string;
}

// Category API endpoints
export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<CategoriesResponse, void>({
      query: () => '/category',
      providesTags: ['Category'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data.map((category: any) => ({
              _id: category._id,
              title: category.title,
              description: category.description,
              parent: category.parent,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
              __v: category.__v,
              productCount: 0 // Will be updated separately
            })),
            message: response.message
          };
        }
        return { success: false, data: [], message: 'Failed to fetch categories' };
      },
    }),

    // Get single category by ID
    getCategoryById: builder.query<CategoryResponse, string>({
      query: (id) => `/category/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id,
              title: response.data.title,
              description: response.data.description,
              parent: response.data.parent,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
              __v: response.data.__v,
              productCount: response.data.productCount || 0
            },
            message: response.message
          };
        }
        return { success: false, data: {} as CategoryData, message: 'Failed to fetch category' };
      },
    }),

    // Create new category
    createCategory: builder.mutation<CategoryResponse, CreateCategoryData>({
      query: (categoryData) => ({
        url: '/category/create',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id,
              title: response.data.title,
              description: response.data.description,
              parent: response.data.parent,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
              __v: response.data.__v,
              productCount: 0
            },
            message: response.message
          };
        }
        return { success: false, data: {} as CategoryData, message: 'Failed to create category' };
      },
    }),

    // Update category
    updateCategory: builder.mutation<CategoryResponse, { id: string; data: UpdateCategoryData }>({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: {
              _id: response.data._id,
              title: response.data.title,
              description: response.data.description,
              parent: response.data.parent,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
              __v: response.data.__v,
              productCount: response.data.productCount || 0
            },
            message: response.message
          };
        }
        return { success: false, data: {} as CategoryData, message: 'Failed to update category' };
      },
    }),

    // Delete category
    deleteCategory: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category', id }, 'Category'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Category deleted successfully'
        };
      },
    }),

    // Get products by category
    getProductsByCategory: builder.query<ProductsByCategoryResponse, string>({
      query: (categoryId) => `/products/category/${categoryId}`,
      providesTags: (result, error, categoryId) => [{ type: 'Product', id: `category-${categoryId}` }],
      transformResponse: (response: any) => {
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        }
        return { success: false, data: [], message: 'Failed to fetch products' };
      },
    }),

    // Bulk delete categories
    bulkDeleteCategories: builder.mutation<{ success: boolean; message?: string }, string[]>({
      query: (categoryIds) => ({
        url: '/category/bulk-delete',
        method: 'DELETE',
        body: { categoryIds },
      }),
      invalidatesTags: ['Category'],
      transformResponse: (response: any) => {
        return {
          success: response.success || false,
          message: response.message || 'Categories deleted successfully'
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsByCategoryQuery,
  useBulkDeleteCategoriesMutation,
} = categoriesApi;

// Export the API slice
export default categoriesApi;
