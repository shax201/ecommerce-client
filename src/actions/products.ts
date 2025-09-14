"use server";

import { unstable_cache } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";
import { revalidateTag } from "next/cache";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000"
  );
};

// ===== TYPES =====

export interface ProductVariant {
  sku: string;
  color: {
    id: string;
    name: string;
    code: string;
  };
  size: {
    id: string;
    size: string;
  };
  price: number;
  stock: number;
  images?: string[];
  isActive: boolean;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug: string;
  canonicalUrl?: string;
}

export interface ProductAnalytics {
  views: number;
  purchases: number;
  wishlistCount: number;
  averageRating: number;
  totalReviews: number;
  lastViewed?: string;
  lastPurchased?: string;
}

export interface ProductInventory {
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  primaryImage: string;
  optionalImages?: string[];
  regularPrice: number;
  discountPrice: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  variants?: ProductVariant[];
  inventory: ProductInventory;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured: boolean;
  tags?: string[];
  seo?: ProductSEO;
  analytics?: ProductAnalytics;
  categories: Array<{
    id: string;
    title: string;
  }>;
  colors: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  sizes: Array<{
    id: string;
    size: string;
  }>;
  relatedProducts?: string[];
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  discountPercentage?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unlimited';
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: {
    response: string;
    respondedBy: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  helpfulPercentage?: number;
  timeAgo?: string;
}

export interface ProductWishlist {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  // Virtual fields
  timeAgo?: string;
}

export interface ProductFilters {
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

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SingleProductResponse {
  success: boolean;
  message: string;
  data?: Product;
}

export interface ProductError {
  success: false;
  message: string;
  error?: string;
}

// ===== CACHED FETCH FUNCTIONS =====

// Cached function for fetching products with ISR
const fetchProductsData = unstable_cache(
  async (filters: ProductFilters = {}): Promise<ProductResponse> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.limit) searchParams.set('limit', filters.limit.toString());
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);
      if (filters.minPrice) searchParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.colors) searchParams.set('colors', filters.colors.join(','));
      if (filters.sizes) searchParams.set('sizes', filters.sizes.join(','));
      if (filters.categories) searchParams.set('categories', filters.categories.join(','));
      if (filters.status) searchParams.set('status', filters.status.join(','));
      if (filters.featured !== undefined) searchParams.set('featured', filters.featured.toString());
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.inStock !== undefined) searchParams.set('inStock', filters.inStock.toString());
      if (filters.rating) searchParams.set('rating', filters.rating.toString());

      const response = await fetch(`${getBackendUrl()}/api/v1/products?${searchParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // Revalidate every minute
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || "Products fetched successfully",
          data: data.data || [],
          pagination: data.pagination,
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch products",
          data: [],
        };
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        message: "Failed to fetch products",
        data: [],
      };
    }
  },
  ["products"],
  {
    tags: [ISR_TAGS.PRODUCTS],
    revalidate: 60, // 1 minute
  }
);

// Cached function for fetching single product
const fetchProductData = unstable_cache(
  async (productId: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${getBackendUrl()}/products/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error("Failed to fetch product:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },
  ["product"],
  {
    tags: [ISR_TAGS.PRODUCTS],
    revalidate: 60, // 1 minute
  }
);

// Cached function for fetching product reviews
const fetchProductReviewsData = unstable_cache(
  async (productId: string, filters: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'createdAt' | 'rating' | 'helpful';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    reviews: ProductReview[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('productId', productId);
      
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.limit) searchParams.set('limit', filters.limit.toString());
      if (filters.rating) searchParams.set('rating', filters.rating.toString());
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);

      const response = await fetch(`${getBackendUrl()}/api/v1/products/reviews?${searchParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 30 }, // Revalidate every 30 seconds
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error("Failed to fetch product reviews:", data.message);
        return { reviews: [], total: 0, page: 1, totalPages: 0 };
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      return { reviews: [], total: 0, page: 1, totalPages: 0 };
    }
  },
  ["product-reviews"],
  {
    tags: [ISR_TAGS.PRODUCTS],
    revalidate: 30, // 30 seconds
  }
);

// ===== PUBLIC API FUNCTIONS =====

export async function getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
  try {
    return await fetchProductsData(filters);
  } catch (error) {
    console.error("Error in getProducts:", error);
    return {
      success: false,
      message: "Failed to fetch products",
      data: [],
    };
  }
}

export async function getProduct(productId: string): Promise<Product | null> {
  try {
    return await fetchProductData(productId);
  } catch (error) {
    console.error("Error in getProduct:", error);
    return null;
  }
}

// Alias for getProduct to match existing imports
export const getSingleProduct = getProduct;

// Alias for getProducts to match existing imports
export const getAllProducts = getProducts;

// Function to get products by category
export async function getProductsByCategory(categoryId: string, filters: ProductFilters = {}): Promise<ProductResponse> {
  try {
    const categoryFilters = {
      ...filters,
      categories: [categoryId],
    };
    return await getProducts(categoryFilters);
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return {
      success: false,
      message: "Failed to fetch products by category",
      data: [],
    };
  }
}

export async function getProductReviews(
  productId: string,
  filters: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'createdAt' | 'rating' | 'helpful';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{
  reviews: ProductReview[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    return await fetchProductReviewsData(productId, filters);
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    return { reviews: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getProductAnalytics(): Promise<any> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/v1/products/analytics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch product analytics:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    return null;
  }
}

export async function getNewArrivals(limit: number = 10): Promise<Product[]> {
  try {
    const response = await fetch(`${getBackendUrl()}/products?limit=${limit}&sortBy=createdAt&sortOrder=desc`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });


    const data = await response.json();


    if (response.ok && data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch new arrivals:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

export async function getTopSellingProducts(limit: number = 10): Promise<Product[]> {
  try {
    const response = await fetch(`${getBackendUrl()}/products/top-selling?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    const data = await response.json();


    if (response.ok && data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch top selling products:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
}

export async function getRelatedProducts(productId: string, limit: number = 5): Promise<Product[]> {
  try {
    const response = await fetch(`${getBackendUrl()}/products/analytics/${productId}/related?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Revalidate every minute
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch related products:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

// ===== MUTATION FUNCTIONS =====

export async function createProductReview(reviewData: {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}): Promise<SingleProductResponse | ProductError> {
  try {
    const response = await fetch(`${getBackendUrl()}/products/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Revalidate products cache
      await revalidateProducts();
      return {
        success: true,
        message: data.message || "Review created successfully",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create review",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      message: "Failed to create review",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function addToWishlist(productId: string, notes?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<SingleProductResponse | ProductError> {
  try {
    const response = await fetch(`${getBackendUrl()}/products/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, notes, priority }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Revalidate products cache
      await revalidateProducts();
      return {
        success: true,
        message: data.message || "Product added to wishlist successfully",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to add to wishlist",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return {
      success: false,
      message: "Failed to add to wishlist",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function removeFromWishlist(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/products/wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Revalidate products cache
      await revalidateProducts();
      return {
        success: true,
        message: data.message || "Product removed from wishlist successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to remove from wishlist",
      };
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return {
      success: false,
      message: "Failed to remove from wishlist",
    };
  }
}

export async function getWishlist(filters: {
  priority?: 'low' | 'medium' | 'high';
  page?: number;
  limit?: number;
  sortBy?: 'addedAt' | 'priority' | 'productTitle';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<{
  items: ProductWishlist[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const searchParams = new URLSearchParams();
    
    if (filters.priority) searchParams.set('priority', filters.priority);
    if (filters.page) searchParams.set('page', filters.page.toString());
    if (filters.limit) searchParams.set('limit', filters.limit.toString());
    if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);

    const response = await fetch(`${getBackendUrl()}/products/wishlist?${searchParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return data.data;
    } else {
      console.error("Failed to fetch wishlist:", data.message);
      return { items: [], total: 0, page: 1, totalPages: 0 };
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function trackProductView(productId: string): Promise<void> {
  try {
    await fetch(`${getBackendUrl()}/products/analytics/${productId}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error tracking product view:", error);
  }
}

// ===== REVALIDATION FUNCTIONS =====

export async function revalidateProducts() {
  "use server";
  try {
    revalidateTag(ISR_TAGS.PRODUCTS);
    console.log("✅ Products cache revalidated");
    return {
      success: true,
      message: "Products cache revalidated successfully",
    };
  } catch (error) {
    console.error("❌ Error revalidating products:", error);
    return { success: false, message: "Failed to revalidate products cache" };
  }
}