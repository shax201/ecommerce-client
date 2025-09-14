"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { getSingleProduct, SingleProductResponse } from "@/actions/products";

interface ProductISRProps {
  productId: string;
  initialProduct?: any;
}

export function useProductISR({ productId, initialProduct }: ProductISRProps) {
  const [product, setProduct] = React.useState<any>(initialProduct);
  const [loading, setLoading] = React.useState(!initialProduct);
  const [error, setError] = React.useState<string | null>(null);

  // Use ref to track if we've already processed the initialProduct
  const processedInitialProductRef = useRef<string | null>(null);

  // Memoize productId to detect changes
  const productIdKey = useMemo(() => productId, [productId]);

  // Memoize initialProduct to detect changes
  const initialProductKey = useMemo(() => {
    return initialProduct ? JSON.stringify(initialProduct) : null;
  }, [initialProduct]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedInitialProductRef.current === initialProductKey) {
      return;
    }

    if (initialProduct) {
      // Use ISR data if available
      setProduct(initialProduct);
      setLoading(false);
      setError(null);
      processedInitialProductRef.current = initialProductKey;
    } else {
      // Fallback to client-side fetching if no ISR data
      loadProduct();
    }
  }, [productIdKey, initialProductKey]);

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const product = await getSingleProduct(productId);

      if (product) {
        setProduct(product);
      } else {
        setProduct(null);
        setError("Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const dataSource = useMemo(() => {
    return {
      productFromServer: !!initialProduct,
      productFromClient: !initialProduct,
    };
  }, [initialProduct]);

  const refresh = useCallback(() => {
    if (initialProduct) {
      // Reset processed ref to allow re-processing server data
      processedInitialProductRef.current = null;
      setProduct(initialProduct);
      setLoading(false);
      setError(null);
    } else {
      loadProduct();
    }
  }, [initialProduct, loadProduct]);

  return {
    product,
    loading,
    error,
    dataSource,
    // Performance metrics
    performanceMetrics: {
      hasServerData: !!initialProduct,
      dataCompleteness: {
        hasProduct: !!product,
        hasValidProduct: product && Object.keys(product).length > 0,
      },
    },
    // Actions
    refresh,
    loadProduct,
  };
}

// Helper function to determine if product should use ISR data
export function shouldUseProductISRData(props: ProductISRProps): boolean {
  return !!props.initialProduct;
}

// Helper function to get product performance metrics
export function getProductPerformanceMetrics(props: ProductISRProps) {
  return {
    hasServerData: shouldUseProductISRData(props),
    missingServerData: {
      initialProduct: !props.initialProduct,
    },
    dataCompleteness: {
      hasProductId: !!props.productId,
      hasInitialProduct: !!props.initialProduct,
    },
  };
}
