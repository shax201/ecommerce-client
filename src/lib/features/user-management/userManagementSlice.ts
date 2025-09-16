import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserQuery, UserStats } from '@/lib/services/user-management-service';

interface UserManagementState {
  users: User[];
  selectedUsers: string[];
  filters: UserQuery;
  stats: UserStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialState: UserManagementState = {
  users: [],
  selectedUsers: [],
  filters: {
    page: 1,
    limit: 10,
    search: '',
    role: undefined,
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
  searchTerm: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSelectedUsers: (state, action: PayloadAction<string[]>) => {
      state.selectedUsers = action.payload;
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const index = state.selectedUsers.indexOf(userId);
      if (index > -1) {
        state.selectedUsers.splice(index, 1);
      } else {
        state.selectedUsers.push(userId);
      }
    },
    clearSelection: (state) => {
      state.selectedUsers = [];
    },
    setFilters: (state, action: PayloadAction<Partial<UserQuery>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setStats: (state, action: PayloadAction<UserStats>) => {
      state.stats = action.payload;
    },
    setPagination: (state, action: PayloadAction<typeof initialState.pagination>) => {
      state.pagination = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filters.search = action.payload;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user._id !== action.payload);
      state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.unshift(action.payload);
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        search: '',
        role: undefined,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      state.searchTerm = '';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    },
    resetState: () => initialState,
  },
});

export const {
  setUsers,
  setSelectedUsers,
  toggleUserSelection,
  clearSelection,
  setFilters,
  setStats,
  setPagination,
  setLoading,
  setError,
  setSearchTerm,
  setSorting,
  updateUser,
  removeUser,
  addUser,
  resetFilters,
  resetState,
} = userManagementSlice.actions;

export default userManagementSlice.reducer;
