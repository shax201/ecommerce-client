import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientQuery, ClientStats } from '@/lib/services/client-management-service';

interface ClientState {
  clients: Client[];
  selectedClients: string[];
  filters: ClientQuery;
  stats: ClientStats | null;
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
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingClient: Client | null;
  isBulkActionsOpen: boolean;
}

const initialState: ClientState = {
  clients: [],
  selectedClients: [],
  filters: {
    page: 1,
    limit: 10,
    search: '',
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
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  editingClient: null,
  isBulkActionsOpen: false,
};

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    // Client data management
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.unshift(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(client => client._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    removeClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(client => client._id !== action.payload);
      state.selectedClients = state.selectedClients.filter(id => id !== action.payload);
    },

    // Selection management
    setSelectedClients: (state, action: PayloadAction<string[]>) => {
      state.selectedClients = action.payload;
    },
    toggleClientSelection: (state, action: PayloadAction<string>) => {
      const clientId = action.payload;
      const index = state.selectedClients.indexOf(clientId);
      if (index > -1) {
        state.selectedClients.splice(index, 1);
      } else {
        state.selectedClients.push(clientId);
      }
    },
    clearSelection: (state) => {
      state.selectedClients = [];
    },
    selectAllClients: (state) => {
      state.selectedClients = state.clients.map(client => client._id!);
    },

    // Filter management
    setFilters: (state, action: PayloadAction<Partial<ClientQuery>>) => {
      state.filters = { ...state.filters, ...action.payload };
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
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        search: '',
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      state.searchTerm = '';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    },

    // Stats management
    setStats: (state, action: PayloadAction<ClientStats>) => {
      state.stats = action.payload;
    },

    // Pagination management
    setPagination: (state, action: PayloadAction<typeof initialState.pagination>) => {
      state.pagination = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
      state.filters.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.filters.limit = action.payload;
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Dialog management
    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateDialogOpen = action.payload;
    },
    setEditDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditDialogOpen = action.payload;
      if (!action.payload) {
        state.editingClient = null;
      }
    },
    setEditingClient: (state, action: PayloadAction<Client | null>) => {
      state.editingClient = action.payload;
    },
    setBulkActionsOpen: (state, action: PayloadAction<boolean>) => {
      state.isBulkActionsOpen = action.payload;
    },

    // Reset state
    resetState: () => initialState,
  },
});

export const {
  setClients,
  addClient,
  updateClient,
  removeClient,
  setSelectedClients,
  toggleClientSelection,
  clearSelection,
  selectAllClients,
  setFilters,
  setSearchTerm,
  setSorting,
  resetFilters,
  setStats,
  setPagination,
  setPage,
  setLimit,
  setLoading,
  setError,
  clearError,
  setCreateDialogOpen,
  setEditDialogOpen,
  setEditingClient,
  setBulkActionsOpen,
  resetState,
} = clientSlice.actions;

export default clientSlice.reducer;
