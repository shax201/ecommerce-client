"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemsPerPage?: number;
  showInfo?: boolean;
  showJumpButtons?: boolean;
  className?: string;
}

/**
 * Enhanced Product Pagination Component
 * Provides comprehensive pagination controls with various display options
 */
export default function ProductPagination({
  pagination,
  onPageChange,
  isLoading = false,
  itemsPerPage = 12,
  showInfo = true,
  showJumpButtons = true,
  className = "",
}: ProductPaginationProps) {
  const {
    currentPage,
    totalPages,
    totalProducts,
    hasNextPage,
    hasPrevPage,
  } = pagination;

  // Don't render if there's only one page or no products
  if (totalPages <= 1) {
    return null;
  }

  // Calculate display range
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  // Calculate product range for display
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProducts);

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handleJumpToFirst = () => {
    if (currentPage !== 1 && !isLoading) {
      onPageChange(1);
    }
  };

  const handleJumpToLast = () => {
    if (currentPage !== totalPages && !isLoading) {
      onPageChange(totalPages);
    }
  };

  const handlePrevious = () => {
    if (hasPrevPage && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Product Info */}
      {showInfo && (
        <div className="text-center text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalProducts} products
          {totalPages > 1 && (
            <span className="ml-2">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center">
        <Pagination className="justify-center">
          <PaginationContent className="flex items-center gap-1">
            {/* Jump to First */}
            {showJumpButtons && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleJumpToFirst}
                  disabled={!hasPrevPage || isLoading}
                  className="h-8 w-8 p-0"
                  title="Go to first page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}

            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
                className={`border border-gray-300 hover:bg-gray-50 ${
                  !hasPrevPage || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </PaginationPrevious>
            </PaginationItem>

            {/* Page Numbers */}
            {visiblePages.map((page, index) => {
              if (page === "...") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis className="text-gray-500" />
                  </PaginationItem>
                );
              }

              const pageNumber = page as number;
              const isActive = pageNumber === currentPage;

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(pageNumber);
                    }}
                    className={`${
                      isActive
                        ? "bg-black text-white border-black hover:bg-gray-800"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    } ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    isActive={isActive}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className={`border border-gray-300 hover:bg-gray-50 ${
                  !hasNextPage || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </PaginationNext>
            </PaginationItem>

            {/* Jump to Last */}
            {showJumpButtons && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleJumpToLast}
                  disabled={!hasNextPage || isLoading}
                  className="h-8 w-8 p-0"
                  title="Go to last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

      {/* Quick Page Jump */}
      {totalPages > 10 && (
        <div className="flex justify-center items-center gap-2 text-sm">
          <span className="text-gray-600">Go to page:</span>
          <select
            value={currentPage}
            onChange={(e) => handlePageClick(parseInt(e.target.value))}
            disabled={isLoading}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Loading products...
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact pagination for mobile or space-constrained areas
 */
export function CompactPagination({
  pagination,
  onPageChange,
  isLoading = false,
  className = "",
}: Omit<ProductPaginationProps, 'showInfo' | 'showJumpButtons' | 'itemsPerPage'>) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || isLoading}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-gray-600">
        {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
