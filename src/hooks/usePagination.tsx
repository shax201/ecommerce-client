"use client";

import { useState, useCallback, useMemo } from "react";

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
  maxVisiblePages?: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startItem: number;
  endItem: number;
}

interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  reset: () => void;
}

/**
 * Custom hook for managing pagination state and actions
 */
export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
  maxVisiblePages = 5,
}: UsePaginationProps): PaginationState & PaginationActions {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / currentItemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * currentItemsPerPage + 1;
  const endItem = Math.min(currentPage * currentItemsPerPage, totalItems);

  // Actions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setItemsPerPage = useCallback((newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setCurrentItemsPerPage(itemsPerPage);
  }, [initialPage, itemsPerPage]);

  // Get visible page numbers for pagination display
  const getVisiblePages = useCallback(() => {
    const delta = Math.floor(maxVisiblePages / 2);
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  return {
    // State
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: currentItemsPerPage,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    
    // Actions
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    reset,
    
    // Utilities
    getVisiblePages,
  };
}

/**
 * Hook for URL-based pagination that syncs with URL parameters
 */
export function useUrlPagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
  maxVisiblePages = 5,
}: UsePaginationProps & {
  onPageChange?: (page: number) => void;
}) {
  const pagination = usePagination({
    totalItems,
    itemsPerPage,
    initialPage,
    maxVisiblePages,
  });

  const handlePageChange = useCallback((page: number) => {
    pagination.goToPage(page);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
  }, [pagination]);

  return {
    ...pagination,
    goToPage: handlePageChange,
  };
}

/**
 * Hook for API-based pagination that handles loading states
 */
export function useApiPagination<T>({
  data,
  totalItems,
  itemsPerPage,
  initialPage = 1,
  isLoading = false,
  error = null,
}: {
  data: T[];
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
  isLoading?: boolean;
  error?: any;
}) {
  const pagination = usePagination({
    totalItems,
    itemsPerPage,
    initialPage,
  });

  return {
    ...pagination,
    data,
    isLoading,
    error,
    isEmpty: !isLoading && data.length === 0,
    hasError: !!error,
  };
}
