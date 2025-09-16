"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { 
  useGetUsersQuery, 
  useGetUserStatsQuery,
  useSearchUsersQuery 
} from '@/lib/features/user-management';
import { 
  setUsers, 
  setStats, 
  setPagination, 
  setLoading, 
  setError,
  setFilters 
} from '@/lib/features/user-management';
import { UserQuery } from '@/lib/services/user-management-service';
import { logISRError, measureISRPerformance } from '@/lib/isr-utils';

interface UseUsersISROptions {
  initialQuery?: UserQuery;
  enableStats?: boolean;
  enableSearch?: boolean;
  revalidateTime?: number;
}

export const useUsersISR = (options: UseUsersISROptions = {}) => {
  const {
    initialQuery = {},
    enableStats = true,
    enableSearch = false,
    revalidateTime = 60, // 1 minute default
  } = options;

  const dispatch = useDispatch<AppDispatch>();
  const { users, stats, pagination, loading, error, filters } = useSelector(
    (state: RootState) => state.userManagement
  );

  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isStale, setIsStale] = useState(false);

  // Memoize the initial query to prevent unnecessary re-renders
  const memoizedInitialQuery = useMemo(() => initialQuery, [
    initialQuery.page,
    initialQuery.limit,
    initialQuery.search,
    initialQuery.role,
    initialQuery.status,
    initialQuery.sortBy,
    initialQuery.sortOrder,
    initialQuery.dateFrom,
    initialQuery.dateTo,
  ]);

  // RTK Query hooks
  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery(filters, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetUserStatsQuery(undefined, {
    skip: !enableStats,
    refetchOnMountOrArgChange: true,
  });

  // Check if data is stale
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    const shouldRevalidate = timeSinceLastFetch > revalidateTime * 1000;
    
    if (shouldRevalidate && !usersLoading) {
      setIsStale(true);
    }
  }, [lastFetchTime, revalidateTime, usersLoading]);

  // Update Redux state when data changes
  useEffect(() => {
    if (usersData?.success) {
      dispatch(setUsers(usersData.data));
      if (usersData.pagination) {
        dispatch(setPagination(usersData.pagination));
      }
      setLastFetchTime(Date.now());
      setIsStale(false);
    }
  }, [usersData, dispatch]);

  useEffect(() => {
    if (statsData?.success && enableStats) {
      dispatch(setStats(statsData.data));
    }
  }, [statsData, dispatch, enableStats]);

  // Update loading state
  useEffect(() => {
    dispatch(setLoading(usersLoading || (enableStats && statsLoading)));
  }, [usersLoading, statsLoading, enableStats, dispatch]);

  // Update error state
  useEffect(() => {
    const errorMessage = usersError || statsError;
    if (errorMessage) {
      const message = 'data' in errorMessage ? 
        (errorMessage.data as any)?.message || 'Failed to fetch data' :
        'Failed to fetch data';
      dispatch(setError(message));
      logISRError('useUsersISR', errorMessage);
    } else {
      dispatch(setError(null));
    }
  }, [usersError, statsError, dispatch]);

  // Update filters when initialQuery changes - only run once on mount
  useEffect(() => {
    if (Object.keys(memoizedInitialQuery).length > 0) {
      dispatch(setFilters(memoizedInitialQuery));
    }
  }, [memoizedInitialQuery, dispatch]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      await measureISRPerformance('useUsersISR-refresh', async () => {
        await Promise.all([
          refetchUsers(),
          enableStats ? refetchStats() : Promise.resolve(),
        ]);
      });
    } catch (error) {
      logISRError('useUsersISR-refresh', error);
    }
  }, [refetchUsers, refetchStats, enableStats]);

  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<UserQuery>) => {
    dispatch(setFilters({ ...filters, ...newFilters }));
  }, [dispatch, filters]);

  // Reset filters function
  const resetFilters = useCallback(() => {
    dispatch(setFilters(memoizedInitialQuery));
  }, [dispatch, memoizedInitialQuery]);

  return {
    // Data
    users,
    stats,
    pagination,
    
    // State
    loading,
    error,
    isStale,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Actions
    refresh,
    refetchUsers,
    refetchStats,
  };
};

// Hook for user search with ISR
export const useUserSearchISR = (searchTerm: string, filters: { role?: string; status?: string } = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters.role, filters.status]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: searchData,
    error: searchError,
    isLoading: searchLoading,
    refetch: refetchSearch,
  } = useSearchUsersQuery(
    { searchTerm: debouncedSearchTerm, filters: memoizedFilters },
    {
      skip: !debouncedSearchTerm || debouncedSearchTerm.length < 2,
      refetchOnMountOrArgChange: true,
    }
  );

  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchData?.success) {
      setSearchResults(searchData.data);
    }
  }, [searchData]);

  useEffect(() => {
    if (searchError) {
      logISRError('useUserSearchISR', searchError);
    }
  }, [searchError]);

  const search = useCallback(async (term: string, searchFilters: { role?: string; status?: string } = {}) => {
    try {
      await measureISRPerformance('useUserSearchISR-search', async () => {
        // This will trigger the query with new parameters
        setDebouncedSearchTerm(term);
      });
    } catch (error) {
      logISRError('useUserSearchISR-search', error);
    }
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    search,
    refetchSearch,
  };
};

// Hook for user statistics with ISR
export const useUserStatsISR = (revalidateTime: number = 300) => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector(
    (state: RootState) => state.userManagement
  );

  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isStale, setIsStale] = useState(false);

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetUserStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Check if data is stale
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    const shouldRevalidate = timeSinceLastFetch > revalidateTime * 1000;
    
    if (shouldRevalidate && !statsLoading) {
      setIsStale(true);
    }
  }, [lastFetchTime, revalidateTime, statsLoading]);

  // Update Redux state when data changes
  useEffect(() => {
    if (statsData?.success) {
      dispatch(setStats(statsData.data));
      setLastFetchTime(Date.now());
      setIsStale(false);
    }
  }, [statsData, dispatch]);

  // Update loading state
  useEffect(() => {
    dispatch(setLoading(statsLoading));
  }, [statsLoading, dispatch]);

  // Update error state
  useEffect(() => {
    if (statsError) {
      const message = 'data' in statsError ? 
        (statsError.data as any)?.message || 'Failed to fetch stats' :
        'Failed to fetch stats';
      dispatch(setError(message));
      logISRError('useUserStatsISR', statsError);
    } else {
      dispatch(setError(null));
    }
  }, [statsError, dispatch]);

  const refresh = useCallback(async () => {
    try {
      await measureISRPerformance('useUserStatsISR-refresh', async () => {
        await refetchStats();
      });
    } catch (error) {
      logISRError('useUserStatsISR-refresh', error);
    }
  }, [refetchStats]);

  return {
    stats,
    loading,
    error,
    isStale,
    refresh,
    refetchStats,
  };
};
