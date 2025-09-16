import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import { useUsersISR } from './use-users-isr';

// Mock the API hooks
jest.mock('@/lib/features/user-management', () => ({
  useGetUsersQuery: jest.fn(() => ({
    data: { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
    error: null,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useGetUserStatsQuery: jest.fn(() => ({
    data: { success: true, data: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, suspendedUsers: 0, adminUsers: 0, clientUsers: 0, newUsersThisMonth: 0, newUsersThisWeek: 0, lastLoginStats: { today: 0, thisWeek: 0, thisMonth: 0 } } },
    error: null,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useSearchUsersQuery: jest.fn(() => ({
    data: { success: true, data: [] },
    error: null,
    isLoading: false,
    refetch: jest.fn(),
  })),
  setUsers: jest.fn(),
  setStats: jest.fn(),
  setPagination: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  setFilters: jest.fn(),
}));

// Mock ISR utils
jest.mock('@/lib/isr-utils', () => ({
  logISRError: jest.fn(),
  measureISRPerformance: jest.fn((name, fn) => fn()),
}));

const createWrapper = () => {
  const store = makeStore().store;
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useUsersISR', () => {
  it('should not cause infinite re-renders', () => {
    const { result } = renderHook(() => useUsersISR({
      initialQuery: {
        page: 1,
        limit: 10,
        search: '',
        role: undefined,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      enableStats: true,
      revalidateTime: 60,
    }), {
      wrapper: createWrapper(),
    });

    // The hook should return stable values
    expect(result.current.users).toBeDefined();
    expect(result.current.stats).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.filters).toBeDefined();
    expect(result.current.updateFilters).toBeDefined();
    expect(result.current.refresh).toBeDefined();
  });

  it('should handle filter updates without infinite loops', () => {
    const { result } = renderHook(() => useUsersISR(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.updateFilters({ page: 2 });
    });

    // Should not cause infinite re-renders
    expect(result.current.filters).toBeDefined();
  });

  it('should handle refresh without infinite loops', async () => {
    const { result } = renderHook(() => useUsersISR(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.refresh();
    });

    // Should complete without infinite loops
    expect(result.current.refresh).toBeDefined();
  });
});
