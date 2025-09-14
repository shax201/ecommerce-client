"use client";

import React, { useMemo, useCallback, useRef } from "react";
import {
  getAllProducts,
  getProductsByCategory,
  ProductResponse,
} from "@/actions/products";

interface ShopISRProps {
  initialProducts?: any[];
  initialPagination?: any;
  category?: string;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
}

export function useShopISR({
  initialProducts = [],
  initialPagination,
  category,
  filters,
}: ShopISRProps) {
  const [products, setProducts] = React.useState<any[]>(initialProducts);
  const [pagination, setPagination] = React.useState(
    initialPagination || {
      total: 0,
      page: 1,
      totalPages: 1,
    }
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Refs to track processed data
  const processedInitialProductsRef = useRef<string | null>(null);
  const processedFiltersRef = useRef<string | null>(null);

  // Memoize filters to detect actual changes
  const filtersKey = useMemo(() => {
    return filters ? JSON.stringify(filters) : null;
  }, [filters]);

  // Memoize initial data keys to detect changes
  const initialProductsKey = useMemo(() => {
    return initialProducts.length > 0 ? JSON.stringify(initialProducts) : null;
  }, [initialProducts]);

  const initialPaginationKey = useMemo(() => {
    return initialPagination ? JSON.stringify(initialPagination) : null;
  }, [initialPagination]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedInitialProductsRef.current === initialProductsKey) {
      return;
    }

    if (initialProducts.length > 0) {
      // Use ISR data if available
      setProducts(initialProducts);
      if (initialPagination) {
        setPagination(initialPagination);
      }
      setLoading(false);
      processedInitialProductsRef.current = initialProductsKey;
    } else {
      // Fallback to client-side fetching if no ISR data
      loadProducts();
    }
  }, [initialProductsKey, initialPaginationKey]);

  // Re-fetch when filters change
  React.useEffect(() => {
    // Skip if we've already processed these exact filters
    if (processedFiltersRef.current === filtersKey) {
      return;
    }

    if (initialProducts.length === 0) {
      loadProducts();
      processedFiltersRef.current = filtersKey;
    }
  }, [filtersKey, initialProducts.length]);

  const loadProducts = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

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
        
        const mappedSortBy = filters?.sortBy ? sortByMap[filters.sortBy] || 'popularity' : undefined;
        const sortOrder: 'asc' | 'desc' = filters?.sortBy === 'price-high-low' ? 'desc' : 'asc';
        
        const params = {
          page,
          limit: 12, // Default items per page
          sortBy: mappedSortBy,
          sortOrder,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
        };

        let response: ProductResponse;

        if (category) {
          response = await getProductsByCategory(category, params);
        } else {
          response = await getAllProducts(params);
        }

        if (response.success && response.data) {
          setProducts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [category, filters]
  );

  const dataSource = useMemo(() => {
    return {
      productsFromServer: initialProducts.length > 0,
      productsFromClient: initialProducts.length === 0,
    };
  }, [initialProducts]);

  const loadMore = useCallback(
    (page: number) => {
      loadProducts(page);
    },
    [loadProducts]
  );

  const refresh = useCallback(() => {
    loadProducts(1);
  }, [loadProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    dataSource,
    // Performance metrics
    performanceMetrics: {
      hasServerData: initialProducts.length > 0,
      dataCompleteness: {
        hasProducts: products.length > 0,
        hasPagination: !!pagination,
      },
    },
    // Actions
    loadMore,
    refresh,
    loadProducts,
  };
}

// Helper function to determine if shop should use ISR data
export function shouldUseShopISRData(props: ShopISRProps): boolean {
  return (props.initialProducts?.length ?? 0) > 0;
}

// Helper function to get shop performance metrics
export function getShopPerformanceMetrics(props: ShopISRProps) {
  return {
    hasServerData: shouldUseShopISRData(props),
    missingServerData: {
      initialProducts: (props.initialProducts?.length ?? 0) === 0,
    },
    dataCompleteness: {
      hasInitialProducts: (props.initialProducts?.length ?? 0) > 0,
      hasPagination: !!props.initialPagination,
      hasFilters: !!props.filters,
    },
  };
}
