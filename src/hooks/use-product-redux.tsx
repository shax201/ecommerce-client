"use client";

import { useMemo } from "react";
import { useGetSingleProductQuery } from "@/lib/features/products/productApi";
import { transformProductData } from "@/lib/utils/product-transform";

interface UseProductReduxProps {
  productId: string;
  skip?: boolean;
}

export function useProductRedux({ productId, skip = false }: UseProductReduxProps) {
  // Use Redux RTK Query hook
  const { 
    data: productData, 
    isLoading, 
    error, 
    isError,
    isSuccess,
    isFetching,
    refetch
  } = useGetSingleProductQuery(productId, {
    skip: !productId || skip
  });

  // Transform product data to ensure consistent format
  const transformedProduct = useMemo(() => {
    const product = productData?.data;
    if (!product) return null;
    
    try {
      return transformProductData(product);
    } catch (error) {
      console.error("Error transforming product data:", error);
      return product; // Fallback to original data
    }
  }, [productData]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      hasServerData: false, // Redux RTK Query handles caching
      dataCompleteness: {
        hasProduct: !!transformedProduct,
        hasValidProduct: transformedProduct && Object.keys(transformedProduct).length > 0,
      },
      cacheStatus: {
        isCached: isSuccess && !isFetching,
        isFetching: isFetching,
        isStale: false, // RTK Query handles staleness
      }
    };
  }, [transformedProduct, isSuccess, isFetching]);

  // Data source information
  const dataSource = useMemo(() => {
    return {
      productFromRedux: true,
      productFromServer: false,
      productFromClient: true,
    };
  }, []);

  return {
    // Core data
    product: transformedProduct,
    loading: isLoading,
    error: error,
    isError,
    isSuccess,
    
    // Performance metrics
    performanceMetrics,
    dataSource,
    
    // Actions
    refetch,
    
    // Additional RTK Query states
    isFetching,
    isUninitialized: !productId || skip,
  };
}

// Helper function to determine if product should use Redux data
export function shouldUseProductReduxData(props: UseProductReduxProps): boolean {
  return !!props.productId && !props.skip;
}

// Helper function to get product performance metrics
export function getProductReduxPerformanceMetrics(props: UseProductReduxProps) {
  return {
    hasProductId: !!props.productId,
    shouldSkip: props.skip,
    dataCompleteness: {
      hasProductId: !!props.productId,
      shouldSkip: props.skip,
    },
  };
}
