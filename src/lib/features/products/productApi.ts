import { Product } from "@/types/product.types";
import { apiSlice } from "../api/apiSlice";

// Import ProductData from the admin products
interface ProductData {
  _id: string;
  title: string;
  description: string;
  primaryImage: string;
  optionalImages: string[];
  regularPrice: number;
  discountPrice: number;
  videoLink?: string;
  catagory: string[];
  color?: string[];
  size?: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  variants?: {
    color?: string[];
    size?: string[];
  };
}

// ===== INTERFACES =====
interface ProductResponse {
  data: ProductData[];
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

interface CategoryResponse {
  data: ProductData[];
  message: string;
  success: boolean;
}

interface ProductReviewResponse {
  data: {
    reviews: any[];
    total: number;
    page: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

interface WishlistResponse {
  data: {
    items: any[];
    total: number;
    page: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  categories?: string[];
  status?: string[];
  featured?: boolean;
  search?: string;
  inStock?: boolean;
  rating?: number;
}

// ===== API ENDPOINTS =====
export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with filters
    getProducts: builder.query<ProductResponse, ProductFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters && filters.page) params.set('page', filters.page.toString());
        if (filters && filters.limit) params.set('limit', filters.limit.toString());
        if (filters && filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters && filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        if (filters && filters.minPrice) params.set('minPrice', filters.minPrice.toString());
        if (filters && filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
        if (filters && filters.colors) params.set('colors', filters.colors.join(','));
        if (filters && filters.sizes) params.set('sizes', filters.sizes.join(','));
        if (filters && filters.categories) params.set('categories', filters.categories.join(','));
        if (filters && filters.status) params.set('status', filters.status.join(','));
        if (filters && filters.featured !== undefined) params.set('featured', filters.featured.toString());
        if (filters && filters.search) params.set('search', filters.search);
        if (filters && filters.inStock !== undefined) params.set('inStock', filters.inStock.toString());
        if (filters && filters.rating) params.set('rating', filters.rating.toString());

        return {
          url: `/products?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get single product
    getSingleProduct: builder.query<ProductSingleResponse, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Get products by category
    getProductsByCategory: builder.query<ProductResponse, { categoryId: string; filters?: ProductFilters }>({
      query: ({ categoryId, filters = {} }) => {
        const params = new URLSearchParams();
        params.set('categories', categoryId);
        
        if (filters.page) params.set('page', filters.page.toString());
        if (filters.limit) params.set('limit', filters.limit.toString());
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
        if (filters.colors) params.set('colors', filters.colors.join(','));
        if (filters.sizes) params.set('sizes', filters.sizes.join(','));
        if (filters.status) params.set('status', filters.status.join(','));
        if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
        if (filters.search) params.set('search', filters.search);
        if (filters.inStock !== undefined) params.set('inStock', filters.inStock.toString());
        if (filters.rating) params.set('rating', filters.rating.toString());

        return {
          url: `/products?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get new arrivals
    getNewArrivals: builder.query<ProductResponse, { limit?: number }>({
      query: ({ limit = 10 }) => `/products?limit=${limit}&sortBy=createdAt&sortOrder=desc`,
      providesTags: [{ type: 'Product', id: 'NEW_ARRIVALS' }],
    }),

    // Get top selling products
    getTopSellingProducts: builder.query<ProductResponse, { limit?: number }>({
      query: ({ limit = 10 }) => `/products/top-selling?limit=${limit}`,
      providesTags: [{ type: 'Product', id: 'TOP_SELLING' }],
    }),

    // Get related products
    getRelatedProducts: builder.query<ProductResponse, { productId: string; limit?: number }>({
      query: ({ productId, limit = 5 }) => `/products/analytics/${productId}/related?limit=${limit}`,
      providesTags: (result, error, { productId }) => [
        { type: 'Product', id: `RELATED_${productId}` }
      ],
    }),

    // Get product reviews
    getProductReviews: builder.query<ProductReviewResponse, { 
      productId: string; 
      filters?: {
        page?: number;
        limit?: number;
        rating?: number;
        sortBy?: 'createdAt' | 'rating' | 'helpful';
        sortOrder?: 'asc' | 'desc';
      }
    }>({
      query: ({ productId, filters = {} }) => {
        const params = new URLSearchParams();
        params.set('productId', productId);
        
        if (filters.page) params.set('page', filters.page.toString());
        if (filters.limit) params.set('limit', filters.limit.toString());
        if (filters.rating) params.set('rating', filters.rating.toString());
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

        return {
          url: `/api/v1/products/reviews?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { productId }) => [
        { type: 'Product', id: `REVIEWS_${productId}` }
      ],
    }),

    // Get wishlist
    getWishlist: builder.query<WishlistResponse, {
      priority?: 'low' | 'medium' | 'high';
      page?: number;
      limit?: number;
      sortBy?: 'addedAt' | 'priority' | 'productTitle';
      sortOrder?: 'asc' | 'desc';
    }>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.priority) params.set('priority', filters.priority);
        if (filters.page) params.set('page', filters.page.toString());
        if (filters.limit) params.set('limit', filters.limit.toString());
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

        return {
          url: `/products/wishlist?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: [{ type: 'Product', id: 'WISHLIST' }],
    }),

    // Get categories
    getCategories: builder.query<CategoryResponse, void>({
      query: () => "/category",
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // ===== MUTATIONS =====

    // Create product review
    createProductReview: builder.mutation<{ success: boolean; message: string; data?: any }, {
      productId: string;
      rating: number;
      title: string;
      comment: string;
      images?: string[];
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

    // Add to wishlist
    addToWishlist: builder.mutation<{ success: boolean; message: string; data?: any }, {
      productId: string;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
    }>({
      query: ({ productId, notes, priority = 'medium' }) => ({
        url: `/products/wishlist`,
        method: "POST",
        body: { productId, notes, priority },
      }),
      invalidatesTags: [
        { type: 'Product', id: 'WISHLIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Remove from wishlist
    removeFromWishlist: builder.mutation<{ success: boolean; message: string }, string>({
      query: (productId) => ({
        url: `/products/wishlist/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: 'Product', id: 'WISHLIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Track product view
    trackProductView: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/products/analytics/${productId}/view`,
        method: "POST",
      }),
      invalidatesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
      ],
    }),

    // Purchase product (legacy)
    purchaseProduct: builder.mutation<{ success: boolean; message: string; data?: any }, any>({
      query: (data) => ({
        url: `/products/purchase`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // ===== ADMIN MUTATIONS =====

    // Create product (admin)
    createProduct: builder.mutation<{ success: boolean; message: string; data?: any }, {
      title: string;
      sku?: string;
      description: string;
      primaryImage: string;
      optionalImages: string[];
      regularPrice: number;
      discountPrice: number;
      videoLink?: string;
      catagory: string[];
      color: string[];
      size: string[];
    }>({
      query: (productData) => ({
        url: `/products/create`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Update product (admin)
    updateProduct: builder.mutation<{ success: boolean; message: string; data?: any }, {
      id: string;
      data: Partial<{
        title: string;
        sku?: string;
        description: string;
        primaryImage: string;
        optionalImages: string[];
        regularPrice: number;
        discountPrice: number;
        videoLink?: string;
        catagory: string[];
        color: string[];
        size: string[];
      }>;
    }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Delete product (admin)
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Get product analytics (admin)
    getProductAnalytics: builder.query<{
      success: boolean;
      data: {
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        totalRevenue: number;
        averageProductValue: number;
        topSellingProducts: Array<{
          productId: string;
          productName: string;
          sales: number;
          revenue: number;
          views: number;
          conversionRate: number;
        }>;
        categoryPerformance: Array<{
          categoryId: string;
          categoryName: string;
          productCount: number;
          totalRevenue: number;
          averageRating: number;
        }>;
        inventoryValue: number;
        stockTurnover: number;
        priceDistribution: {
          under50: number;
          between50and100: number;
          between100and200: number;
          over200: number;
        };
      };
    }, void>({
      query: () => `/products/analytics`,
      providesTags: [{ type: 'Product', id: 'ANALYTICS' }],
    }),
  }),
});

// ===== EXPORTED HOOKS =====
export const {
  // Queries
  useGetProductsQuery,
  useGetSingleProductQuery,
  useGetProductsByCategoryQuery,
  useGetNewArrivalsQuery,
  useGetTopSellingProductsQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useGetWishlistQuery,
  useGetCategoriesQuery,
  
  // Mutations
  useCreateProductReviewMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useTrackProductViewMutation,
  usePurchaseProductMutation,
  
  // Admin Mutations
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  
  // Admin Queries
  useGetProductAnalyticsQuery,
} = productsApi;
