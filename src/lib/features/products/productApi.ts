import { Product } from "@/types/product.types";
import { apiSlice } from "../api/apiSlice";

interface ProductNewResponse {
  data: Product[];
  message: string;
  success: boolean;
}

interface ProductNewResponse {
  data: Product[];
  message: string;
  success: boolean;
}

interface CategoryResponse {
  data: Product[];
  message: string;
  success: boolean;
}

interface ProductSingleResponse {
  data: Product;
  message: string;
  success: boolean;
}

interface PurchaseProductResponse {
  data: Product;
  message: string;
  success: boolean;
}

interface ProductsResponse {
  data: Product[];
  message: string;
  success: boolean;
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    geNewArials: builder.query<ProductNewResponse, void>({
      query: () => "/products",
    }),
    getCategories: builder.query<CategoryResponse, void>({
      query: () => "/category",
    }),
    getTopSellingProducts: builder.query<ProductNewResponse, void>({
      query: () => "/products",
    }),
    getSingleProduct: builder.query<ProductSingleResponse, string>({
      query: (id) => `/products/${id}`,
    }),
    purchaseProduct: builder.mutation<PurchaseProductResponse, any>({
      query: (data) => ({
        url: `/products/purchase`,
        method: "POST",
        body: data,
      }),
    }),
    getFilteredProducts: builder.query<
      ProductsResponse,
      {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        minPrice?: number;
        maxPrice?: number;
        color?: string[];
        size?: string[];
        categories?: string;
        productType?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 12,
        sortBy = "price",
        sortOrder = "asc",
        minPrice,
        maxPrice,
        color,
        size,
        categories,
        productType,
      }) => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        if (minPrice !== undefined) params.set("minPrice", String(minPrice));
        if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
        if (color?.length) params.set("color", color.join(","));
        if (size?.length) params.set("size", size.join(","));
        if (categories) params.set("categories", categories);
        if (productType) params.set("productType", productType);

        return {
          url: `/products?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGeNewArialsQuery,
  useGetTopSellingProductsQuery,
  useGetSingleProductQuery,
  usePurchaseProductMutation,
  useGetFilteredProductsQuery,
  useGetCategoriesQuery,
} = productsApi;
