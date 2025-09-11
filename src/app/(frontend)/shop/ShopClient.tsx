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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ProductCard from "@/components/common/ProductCard";
import ProductCardSkeleton from "@/components/common/Skeleton";
import { useShopISR } from "@/hooks/use-shop-isr";
import { useRouter, useSearchParams } from "next/navigation";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(filters?.sortBy || "most-popular");

  const {
    products,
    pagination,
    loading,
    error,
    dataSource,
    performanceMetrics,
    loadMore,
    refresh,
  } = useShopISR({
    initialProducts,
    initialPagination,
    category,
    filters,
  });

  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Shop ISR Debug:", {
      loading,
      error,
      productsCount: products.length,
      dataSource,
      performanceMetrics,
      currentPage,
      sortBy,
      category,
    });
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadMore(page);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/shop?${params.toString()}`);
  };

  // Handle sorting
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);

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
                    ? `${(currentPage - 1) * 12 + 1}-${Math.min(currentPage * 12, pagination?.total || 0)}`
                    : "0"}{" "}
                  of {pagination?.total || 0} Products
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
                    <ProductCard key={product.id} data={product} />
                  ))}
                </>
              )}

              {products.length === 0 && !loading && (
                <div className="col-span-full text-center text-black/60">
                  {error ? error : "No products found"}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <>
                <hr className="border-t-black/10" />
                <Pagination className="justify-between">
                  <PaginationPrevious
                    href="#"
                    className="border border-black/10"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                  />
                  <PaginationContent>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        // Show first, last, current, and pages around current
                        const current = currentPage;
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          Math.abs(page - current) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis where needed
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem>
                                <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                className="text-black/50 font-medium text-sm"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}
                  </PaginationContent>
                  <PaginationNext
                    href="#"
                    className="border border-black/10"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                  />
                </Pagination>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
