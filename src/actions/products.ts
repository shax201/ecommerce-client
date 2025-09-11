"use server";

import { Product } from "@/types/product.types";

import { unstable_cache } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";

const getBackendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000"
  );
};

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ProductError {
  success: false;
  message: string;
  data: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  message: string;
  data?: Product;
}

// Cached function for fetching new arrivals with ISR
const fetchNewArrivalsData = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${getBackendUrl()}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching new arrivals data:", error);
      return [];
    }
  },
  ["new-arrivals"],
  {
    tags: [ISR_TAGS.NEW_ARRIVALS, ISR_TAGS.PRODUCTS],
  }
);

// Server action for fetching new arrivals
export async function getNewArrivals(): Promise<
  ProductResponse | ProductError
> {
  try {
    const data = await fetchNewArrivalsData();

    return {
      success: true,
      message: "Products fetched successfully",
      data,
    };
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return {
      success: false,
      message: "An error occurred while fetching products",
      data: [],
    };
  }
}

// Cached function for fetching top selling products with ISR
const fetchTopSellingData = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${getBackendUrl()}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching top selling products data:", error);
      return [];
    }
  },
  ["top-selling"],
  {
    tags: [ISR_TAGS.TOP_SELLING, ISR_TAGS.PRODUCTS],
  }
);

// Server action for fetching top selling products
export async function getTopSellingProducts(): Promise<
  ProductResponse | ProductError
> {
  try {
    const data = await fetchTopSellingData();

    return {
      success: true,
      message: "Top selling products fetched successfully",
      data,
    };
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return {
      success: false,
      message: "An error occurred while fetching top selling products",
      data: [],
    };
  }
}

// Cached function for fetching company settings with ISR
const fetchCompanySettingsData = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(
        `${getBackendUrl()}/company-setting/get-setting`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching company settings data:", error);
      return null;
    }
  },
  ["company-settings"],
  {
    tags: [ISR_TAGS.COMPANY_SETTINGS],
  }
);

// Server action for fetching company settings (for GTM script)
export async function getCompanySettings(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const data = await fetchCompanySettingsData();

    if (data) {
      return {
        success: true,
        message: "Settings fetched successfully",
        data,
      };
    } else {
      return {
        success: false,
        message: "Failed to fetch settings",
      };
    }
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return {
      success: false,
      message: "An error occurred while fetching settings",
    };
  }
}

// Cached function for fetching all products with ISR
const fetchAllProductsData = unstable_cache(
  async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Promise<{ products: Product[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.category) queryParams.append("category", params.category);
      if (params?.minPrice)
        queryParams.append("minPrice", params.minPrice.toString());
      if (params?.maxPrice)
        queryParams.append("maxPrice", params.maxPrice.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

      const url = `${getBackendUrl()}/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          products: data.data || [],
          pagination: data.pagination || {
            total: data.data?.length || 0,
            page: params?.page || 1,
            totalPages: 1,
          },
        };
      }
      return { products: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    } catch (error) {
      console.error("Error fetching all products data:", error);
      return { products: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
  },
  ["all-products"],
  {
    tags: [ISR_TAGS.PRODUCTS],
  }
);

// Server action for fetching all products with ISR
export async function getAllProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}): Promise<ProductResponse | ProductError> {
  try {
    const data = await fetchAllProductsData(params);

    return {
      success: true,
      message: "Products fetched successfully",
      data: data.products,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error fetching all products:", error);
    return {
      success: false,
      message: "An error occurred while fetching products",
      data: [],
    };
  }
}

// Cached function for fetching single product with ISR
const fetchSingleProductData = unstable_cache(
  async (productId: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${getBackendUrl()}/products/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching single product data:", error);
      return null;
    }
  },
  ["single-product"],
  {
    tags: [ISR_TAGS.PRODUCTS],
  }
);

// Server action for fetching single product with ISR
export async function getSingleProduct(
  productId: string
): Promise<SingleProductResponse> {
  try {
    const data = await fetchSingleProductData(productId);

    if (data) {
      return {
        success: true,
        message: "Product fetched successfully",
        data,
      };
    } else {
      return {
        success: false,
        message: "Product not found",
      };
    }
  } catch (error) {
    console.error("Error fetching single product:", error);
    return {
      success: false,
      message: "An error occurred while fetching the product",
    };
  }
}

// Cached function for fetching products by category with ISR
const fetchProductsByCategoryData = unstable_cache(
  async (
    category: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
    }
  ): Promise<{ products: Product[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("category", category);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

      const response = await fetch(
        `${getBackendUrl()}/products?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          products: data.data || [],
          pagination: data.pagination || {
            total: data.data?.length || 0,
            page: params?.page || 1,
            totalPages: 1,
          },
        };
      }
      return { products: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    } catch (error) {
      console.error("Error fetching products by category data:", error);
      return { products: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
  },
  ["products-by-category"],
  {
    tags: [ISR_TAGS.PRODUCTS],
  }
);

// Server action for fetching products by category with ISR
export async function getProductsByCategory(
  category: string,
  params?: { page?: number; limit?: number; sortBy?: string }
): Promise<ProductResponse | ProductError> {
  try {
    const data = await fetchProductsByCategoryData(category, params);

    return {
      success: true,
      message: "Products fetched successfully",
      data: data.products,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      success: false,
      message: "An error occurred while fetching products",
      data: [],
    };
  }
}
