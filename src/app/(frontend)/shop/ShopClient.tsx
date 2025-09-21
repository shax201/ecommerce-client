"use client";

import React, { useState, useEffect } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductPagination from "@/components/common/ProductPagination";
import ProductCard from "@/components/common/ProductCard";
import ProductCardSkeleton from "@/components/common/Skeleton";
import { useReduxProducts } from "@/hooks/useReduxProducts";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/types/product.types";

// Transform ProductData to Product type
const transformProductData = (productData: any): Product => {
  return {
    id: parseInt(productData._id) || 0,
    title: productData.title || "",
    description: productData.description || "",
    primaryImage: productData.primaryImage || "",
    optionalImages: productData.optionalImages || [],
    regularPrice: productData.regularPrice || 0,
    discountPrice: productData.discountPrice || 0,
    price: productData.regularPrice || 0, // Use regularPrice as base price
    discount: {
      amount: productData.discountPrice ? productData.regularPrice - productData.discountPrice : 0,
      percentage: productData.discountPrice ? Math.round(((productData.regularPrice - productData.discountPrice) / productData.regularPrice) * 100) : 0
    },
    rating: 4.5, // Default rating since it's not in ProductData
    catagory: productData.catagory || [],
    variants: {
      color: productData.color?.map((c: string) => ({ name: c, code: c })) || [],
      size: productData.size || []
    },
    colors: productData.color?.map((c: string, index: number) => ({ id: index.toString(), name: c, code: c })) || [],
    sizes: productData.size?.map((s: string, index: number) => ({ id: index.toString(), size: s })) || []
  };
};

interface ShopClientProps {
  initialProducts: any[];
  initialPagination?: any;
  category?: string;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
}

export default function ShopClient({
  initialProducts,
  initialPagination,
  category,
  filters,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState(filters?.sortBy || "most-popular");

  // Use Redux products hook instead of ISR hook
  const {
    products,
    pagination,
    isLoading: loading,
    isError: hasError,
    error,
    updateSorting,
    updatePagination,
    updateSearch,
    updatePriceRange,
    updateCategory,
    clearAllFilters,
    goToNextPage,
    goToPrevPage,
    goToPage,
    refreshProducts,
  } = useReduxProducts();

  // Initialize filters from URL parameters and props
  useEffect(() => {
    // Get all URL parameters
    const urlCategory = searchParams.get('category');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlColor = searchParams.get('color');
    const urlSize = searchParams.get('size');
    const urlSortBy = searchParams.get('sortBy');
    const urlPage = searchParams.get('page');

    // Update price range from URL or props
    if (urlMinPrice && urlMaxPrice) {
      updatePriceRange(parseFloat(urlMinPrice), parseFloat(urlMaxPrice));
    } else if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
      updatePriceRange(filters.minPrice, filters.maxPrice);
    }

    // Update category from URL or props
    if (urlCategory) {
      updateCategory(urlCategory);
    } else if (category) {
      updateCategory(category);
    }

    // Update color from URL
    if (urlColor) {
      // This will be handled by the ColorsSection component
    }

    // Update size from URL
    if (urlSize) {
      // This will be handled by the SizeSection component
    }

    // Update sorting from URL or props
    if (urlSortBy) {
      const sortOrder = urlSortBy === 'price-high-low' ? 'desc' : 'asc';
      updateSorting(urlSortBy, sortOrder);
    } else if (filters?.sortBy) {
      const sortOrder = filters.sortBy === 'price-high-low' ? 'desc' : 'asc';
      updateSorting(filters.sortBy, sortOrder);
    }

    // Update page from URL
    if (urlPage) {
      const pageNumber = parseInt(urlPage);
      if (pageNumber > 0) {
        updatePagination(pageNumber);
      }
    }
  }, [searchParams, filters, category, updatePriceRange, updateCategory, updateSorting, updatePagination]);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Redux Shop Debug:", {
      loading,
      hasError,
      productsCount: products.length,
      pagination,
      sortBy,
      category,
    });
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    goToPage(page);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/shop?${params.toString()}`);
  };

  // Handle sorting
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    
    // Map frontend sort values to backend sort values
    const sortByMap: Record<string, 'createdAt' | 'updatedAt' | 'price' | 'rating' | 'popularity'> = {
      'most-popular': 'popularity',
      'newest': 'createdAt',
      'price-low-high': 'price',
      'price-high-low': 'price',
      'rating': 'rating',
      'name-a-z': 'createdAt',
      'name-z-a': 'createdAt',
    };
    
    const mappedSortBy = sortByMap[newSortBy] || 'popularity';
    const sortOrder: 'asc' | 'desc' = newSortBy === 'price-high-low' ? 'desc' : 'asc';
    
    updateSorting(mappedSortBy, sortOrder);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">
                  {category ? `${category} Products` : "All Products"}
                </h1>
                <MobileFilters />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing{" "}
                  {products.length > 0
                    ? `${(pagination.currentPage - 1) * 12 + 1}-${Math.min(pagination.currentPage * 12, pagination.totalProducts || 0)}`
                    : "0"}{" "}
                  of {pagination.totalProducts || 0} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Most Popular</SelectItem>
                      <SelectItem value="low-price">Low Price</SelectItem>
                      <SelectItem value="high-price">High Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {loading && products.length === 0 ? (
                <>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </>
              ) : (
                <>
                  {products.map((product) => (
                    <ProductCard key={product._id} data={transformProductData(product)} />
                  ))}
                </>
              )}

              {products.length === 0 && !loading && (
                <div className="col-span-full text-center text-black/60">
                  {hasError ? (
                    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data 
                      ? (error.data as any).message 
                      : error && 'message' in error ? (error as any).message : "Failed to load products"
                  ) : "No products found"}
                </div>
              )}
            </div>

            {/* Enhanced Pagination */}
            <ProductPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              isLoading={loading}
              itemsPerPage={12}
              showInfo={true}
              showJumpButtons={pagination.totalPages > 5}
              className="mt-8"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
