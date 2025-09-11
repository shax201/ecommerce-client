"use client";

import React, { useMemo, useCallback, useRef } from "react";
import {
  getAllLogosISR,
  getSingleLogoISR,
  ContentResponse,
} from "@/actions/content";

interface LogoManagementISRProps {
  logosData?: any[];
  logoId?: string;
  filters?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
    type?: string;
  };
}

export function useLogoManagementISR({
  logosData = [],
  logoId,
  filters,
}: LogoManagementISRProps) {
  const [logos, setLogos] = React.useState<any[]>(logosData);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Refs to track processed data
  const processedLogosRef = useRef<string | null>(null);
  const processedFiltersRef = useRef<string | null>(null);

  // Memoize filters to detect actual changes
  const filtersKey = useMemo(() => {
    return filters ? JSON.stringify(filters) : null;
  }, [filters]);

  // Memoize logos data to detect changes
  const logosDataKey = useMemo(() => {
    return logosData.length > 0 ? JSON.stringify(logosData) : null;
  }, [logosData]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedLogosRef.current === logosDataKey) {
      return;
    }

    if (logosData.length > 0) {
      // Use ISR data if available
      setLogos(logosData);
      setLoading(false);
      processedLogosRef.current = logosDataKey;
    } else {
      // Fallback to client-side fetching if no ISR data
      loadLogos();
    }
  }, [logosDataKey]);

  // Re-fetch when filters change
  React.useEffect(() => {
    // Skip if we've already processed these exact filters
    if (processedFiltersRef.current === filtersKey) {
      return;
    }

    if (logosData.length === 0) {
      loadLogos();
      processedFiltersRef.current = filtersKey;
    }
  }, [filtersKey, logosData.length]);

  const loadAllLogos = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 20, // Default items per page for admin
          ...filters,
        };

        const response: ContentResponse = await getAllLogosISR(params);

        if (response.success && response.data) {
          setLogos(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setLogos([]);
        }
      } catch (err) {
        console.error("Error fetching logos:", err);
        setError("Failed to load logos");
        setLogos([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const loadSingleLogo = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentResponse = await getSingleLogoISR(id);

      if (response.success && response.data) {
        setLogos([response.data]);
      } else {
        setLogos([]);
        setError(response.message || "Logo not found");
      }
    } catch (err) {
      console.error("Error fetching logo:", err);
      setError("Failed to load logo");
      setLogos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogos = useCallback(
    async (page: number = 1) => {
      if (logoId) {
        // Load single logo
        await loadSingleLogo(logoId);
      } else {
        // Load all logos
        await loadAllLogos(page);
      }
    },
    [logoId, loadSingleLogo, loadAllLogos]
  );

  const dataSource = useMemo(() => {
    return {
      logosFromServer: logosData.length > 0,
      logosFromClient: logosData.length === 0,
      singleLogoMode: !!logoId,
    };
  }, [logosData, logoId]);

  const loadMore = useCallback(
    (page: number) => {
      loadLogos(page);
    },
    [loadLogos]
  );

  const refresh = useCallback(() => {
    loadLogos(1);
  }, [loadLogos]);

  return {
    logos,
    pagination,
    loading,
    error,
    dataSource,
    // Performance metrics
    performanceMetrics: {
      hasServerData: logosData.length > 0,
      dataCompleteness: {
        hasLogos: logos.length > 0,
        hasPagination: !!pagination,
      },
    },
    // Actions
    loadMore,
    refresh,
    loadLogos,
    loadSingleLogo,
  };
}

// Helper function to determine if logo management should use ISR data
export function shouldUseLogoManagementISRData(
  props: LogoManagementISRProps
): boolean {
  return (props.logosData?.length ?? 0) > 0;
}

// Helper function to get logo management performance metrics
export function getLogoManagementPerformanceMetrics(
  props: LogoManagementISRProps
) {
  return {
    hasServerData: shouldUseLogoManagementISRData(props),
    missingServerData: {
      logos: (props.logosData?.length ?? 0) === 0,
    },
    dataCompleteness: {
      hasLogosData: (props.logosData?.length ?? 0) > 0,
      hasLogoId: !!props.logoId,
      hasFilters: !!props.filters,
    },
  };
}
