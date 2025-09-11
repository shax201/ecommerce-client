"use client";

import React, { useMemo, useCallback, useRef } from "react";
import {
  getAllDynamicMenusISR,
  getSingleDynamicMenuISR,
  ContentResponse,
} from "@/actions/content";

interface DynamicMenuISRProps {
  initialMenus?: any[];
  initialPagination?: any;
  menuId?: string;
  filters?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  };
}

export function useDynamicMenuISR({
  initialMenus = [],
  initialPagination,
  menuId,
  filters,
}: DynamicMenuISRProps) {
  const [menus, setMenus] = React.useState<any[]>(initialMenus);
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
  const processedInitialMenusRef = useRef<string | null>(null);
  const processedFiltersRef = useRef<string | null>(null);

  // Memoize filters to detect actual changes
  const filtersKey = useMemo(() => {
    return filters ? JSON.stringify(filters) : null;
  }, [filters]);

  // Memoize initial data keys to detect changes
  const initialMenusKey = useMemo(() => {
    return initialMenus.length > 0 ? JSON.stringify(initialMenus) : null;
  }, [initialMenus]);

  const initialPaginationKey = useMemo(() => {
    return initialPagination ? JSON.stringify(initialPagination) : null;
  }, [initialPagination]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedInitialMenusRef.current === initialMenusKey) {
      return;
    }

    if (initialMenus.length > 0) {
      // Use ISR data if available
      setMenus(initialMenus);
      if (initialPagination) {
        setPagination(initialPagination);
      }
      setLoading(false);
      processedInitialMenusRef.current = initialMenusKey;
    } else {
      // Fallback to client-side fetching if no ISR data
      loadMenus();
    }
  }, [initialMenusKey, initialPaginationKey]);

  // Re-fetch when filters change
  React.useEffect(() => {
    // Skip if we've already processed these exact filters
    if (processedFiltersRef.current === filtersKey) {
      return;
    }

    if (initialMenus.length === 0) {
      loadMenus();
      processedFiltersRef.current = filtersKey;
    }
  }, [filtersKey, initialMenus.length]);

  const loadAllMenus = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 10, // Default items per page
          ...filters,
        };

        const response: ContentResponse = await getAllDynamicMenusISR(params);

        if (response.success && response.data) {
          setMenus(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setMenus([]);
        }
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError("Failed to load menus");
        setMenus([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const loadSingleMenu = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentResponse = await getSingleDynamicMenuISR(id);

      if (response.success && response.data) {
        setMenus([response.data]);
      } else {
        setMenus([]);
        setError(response.message || "Menu not found");
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError("Failed to load menu");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const dataSource = useMemo(() => {
    return {
      menusFromServer: initialMenus.length > 0,
      menusFromClient: initialMenus.length === 0,
      singleMenuMode: !!menuId,
    };
  }, [initialMenus, menuId]);

  const loadMore = useCallback(
    (page: number) => {
      loadMenus(page);
    },
    [loadMenus]
  );

  const refresh = useCallback(() => {
    loadMenus(1);
  }, [loadMenus]);

  return {
    menus,
    pagination,
    loading,
    error,
    dataSource,
    // Performance metrics
    performanceMetrics: {
      hasServerData: initialMenus.length > 0,
      dataCompleteness: {
        hasMenus: menus.length > 0,
        hasPagination: !!pagination,
      },
    },
    // Actions
    loadMore,
    refresh,
    loadMenus,
    loadSingleMenu,
  };
}

// Helper function to determine if dynamic menu should use ISR data
export function shouldUseDynamicMenuISRData(
  props: DynamicMenuISRProps
): boolean {
  return (props.initialMenus?.length ?? 0) > 0;
}

// Helper function to get dynamic menu performance metrics
export function getDynamicMenuPerformanceMetrics(props: DynamicMenuISRProps) {
  return {
    hasServerData: shouldUseDynamicMenuISRData(props),
    missingServerData: {
      initialMenus: (props.initialMenus?.length ?? 0) === 0,
    },
    dataCompleteness: {
      hasInitialMenus: (props.initialMenus?.length ?? 0) > 0,
      hasMenuId: !!props.menuId,
      hasFilters: !!props.filters,
    },
  };
}
