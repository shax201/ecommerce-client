"use client";

import React, { useMemo, useCallback, useRef } from "react";
import {
  getAllHeroSectionsISR,
  getSingleHeroSectionISR,
  ContentResponse,
} from "@/actions/content";

interface HeroSectionManagementISRProps {
  heroSectionsData?: any[];
  sectionId?: string;
  filters?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  };
}

export function useHeroSectionManagementISR({
  heroSectionsData = [],
  sectionId,
  filters,
}: HeroSectionManagementISRProps) {
  const [heroSections, setHeroSections] =
    React.useState<any[]>(heroSectionsData);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Refs to track processed data
  const processedHeroSectionsRef = useRef<string | null>(null);
  const processedFiltersRef = useRef<string | null>(null);

  // Memoize filters to detect actual changes
  const filtersKey = useMemo(() => {
    return filters ? JSON.stringify(filters) : null;
  }, [filters]);

  // Memoize hero sections data to detect changes
  const heroSectionsDataKey = useMemo(() => {
    return heroSectionsData.length > 0
      ? JSON.stringify(heroSectionsData)
      : null;
  }, [heroSectionsData]);

  // Use server-side data if available, otherwise fetch client-side
  React.useEffect(() => {
    // Skip if we've already processed this exact data
    if (processedHeroSectionsRef.current === heroSectionsDataKey) {
      return;
    }

    if (heroSectionsData.length > 0) {
      // Use ISR data if available
      setHeroSections(heroSectionsData);
      setLoading(false);
      processedHeroSectionsRef.current = heroSectionsDataKey;
    } else {
      // Fallback to client-side fetching if no ISR data
      loadHeroSections();
    }
  }, [heroSectionsDataKey]);

  // Re-fetch when filters change
  React.useEffect(() => {
    // Skip if we've already processed these exact filters
    if (processedFiltersRef.current === filtersKey) {
      return;
    }

    if (heroSectionsData.length === 0) {
      loadHeroSections();
      processedFiltersRef.current = filtersKey;
    }
  }, [filtersKey, heroSectionsData.length]);

  const loadAllSections = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 10, // Default items per page
          ...filters,
        };

        const response: ContentResponse = await getAllHeroSectionsISR(params);

        if (response.success && response.data) {
          setHeroSections(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setHeroSections([]);
        }
      } catch (err) {
        console.error("Error fetching hero sections:", err);
        setError("Failed to load hero sections");
        setHeroSections([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const loadSingleSection = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentResponse = await getSingleHeroSectionISR(id);

      if (response.success && response.data) {
        setHeroSections([response.data]);
      } else {
        setHeroSections([]);
        setError(response.message || "Hero section not found");
      }
    } catch (err) {
      console.error("Error fetching hero section:", err);
      setError("Failed to load hero section");
      setHeroSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const dataSource = useMemo(() => {
    return {
      sectionsFromServer: heroSectionsData.length > 0,
      sectionsFromClient: heroSectionsData.length === 0,
      singleSectionMode: !!sectionId,
    };
  }, [heroSectionsData, sectionId]);

  const loadMore = useCallback(
    (page: number) => {
      loadHeroSections(page);
    },
    [loadHeroSections]
  );

  const refresh = useCallback(() => {
    loadHeroSections(1);
  }, [loadHeroSections]);

  return {
    heroSections,
    pagination,
    loading,
    error,
    dataSource,
    // Performance metrics
    performanceMetrics: {
      hasServerData: heroSectionsData.length > 0,
      dataCompleteness: {
        hasSections: heroSections.length > 0,
        hasPagination: !!pagination,
      },
    },
    // Actions
    loadMore,
    refresh,
    loadHeroSections,
    loadSingleSection,
  };
}

// Helper function to determine if hero section management should use ISR data
export function shouldUseHeroSectionManagementISRData(
  props: HeroSectionManagementISRProps
): boolean {
  return (props.heroSectionsData?.length ?? 0) > 0;
}

// Helper function to get hero section management performance metrics
export function getHeroSectionManagementPerformanceMetrics(
  props: HeroSectionManagementISRProps
) {
  return {
    hasServerData: shouldUseHeroSectionManagementISRData(props),
    missingServerData: {
      heroSections: (props.heroSectionsData?.length ?? 0) === 0,
    },
    dataCompleteness: {
      hasHeroSections: (props.heroSectionsData?.length ?? 0) > 0,
      hasSectionId: !!props.sectionId,
      hasFilters: !!props.filters,
    },
  };
}
