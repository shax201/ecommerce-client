"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { getActiveClientLogos, ContentResponse } from "@/actions/content";

interface BrandsISRProps {
  clientLogos?: any[];
}

export function useBrandsISR({ clientLogos }: BrandsISRProps) {
  const [brands, setBrands] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Use ref to track if we've already processed the clientLogos
  const processedClientLogosRef = useRef<string | null>(null);

  // Memoize the sorted clientLogos to prevent unnecessary re-renders
  const sortedClientLogos = useMemo(() => {
    if (!clientLogos || clientLogos.length === 0) return null;

    // Create a copy before sorting to avoid mutating the original array
    const sorted = [...clientLogos].sort(
      (a: any, b: any) => (a.order || 0) - (b.order || 0)
    );
    return sorted;
  }, [clientLogos]);

  // Memoize the clientLogos JSON string to detect actual changes
  const clientLogosKey = useMemo(() => {
    return clientLogos ? JSON.stringify(clientLogos) : null;
  }, [clientLogos]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedClientLogosRef.current === clientLogosKey) {
      return;
    }

    if (sortedClientLogos) {
      // Use server-side data
      setBrands(sortedClientLogos);
      setLoading(false);
      setError(null);
      processedClientLogosRef.current = clientLogosKey;
    } else {
      // Fallback to client-side fetching if no server data
      fetchBrands();
    }
  }, [clientLogosKey, sortedClientLogos]);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentResponse = await getActiveClientLogos();

      if (response.success && response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          // Sort by order field if available (create copy to avoid mutation)
          const sortedBrands = [...response.data].sort(
            (a: any, b: any) => (a.order || 0) - (b.order || 0)
          );
          setBrands(sortedBrands);
        } else {
          // API succeeded but returned empty array - no brands in database
          setBrands([]);
        }
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
      setError("Failed to load brands");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const dataSource = useMemo(() => {
    return {
      brandsFromServer: clientLogos !== undefined,
      brandsFromClient: clientLogos === undefined,
    };
  }, [clientLogos]);

  // Memoize refresh function to prevent unnecessary re-renders
  const refresh = useCallback(() => {
    if (clientLogos && clientLogos.length > 0) {
      // Reset processed ref to allow re-processing server data
      processedClientLogosRef.current = null;
      setBrands(sortedClientLogos || []);
      setLoading(false);
      setError(null);
    } else {
      fetchBrands();
    }
  }, [clientLogos, sortedClientLogos, fetchBrands]);

  return {
    brands,
    loading,
    error,
    dataSource,
    // Actions
    refresh,
    // Performance metrics
    performanceMetrics: {
      hasServerData: clientLogos !== undefined,
      dataCompleteness: {
        hasBrands: brands.length > 0,
      },
    },
  };
}

// Helper function to determine if brands should use ISR data
export function shouldUseBrandsISRData(props: BrandsISRProps): boolean {
  return props.clientLogos !== undefined;
}

// Helper function to get brands performance metrics
export function getBrandsPerformanceMetrics(props: BrandsISRProps) {
  return {
    hasServerData: shouldUseBrandsISRData(props),
    missingServerData: {
      clientLogos: props.clientLogos === undefined,
    },
    dataCompleteness: {
      hasClientLogos: (props.clientLogos?.length ?? 0) > 0,
    },
  };
}
