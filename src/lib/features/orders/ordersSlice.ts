import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderData } from "./ordersApi";

interface OrdersState {
  selectedOrder: OrderData | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string;
    dateRange: {
      start: string;
      end: string;
    };
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: OrdersState = {
  selectedOrder: null,
  isLoading: false,
  error: null,
  filters: {
    status: "all",
    dateRange: {
      start: "",
      end: "",
    },
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<OrderData | null>) => {
      state.selectedOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    setDateRangeFilter: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.filters.dateRange = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        dateRange: {
          start: "",
          end: "",
        },
        search: "",
      };
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit: number; total: number }>) => {
      state.pagination = action.payload;
    },
    resetOrdersState: (state) => {
      state.selectedOrder = null;
      state.isLoading = false;
      state.error = null;
      state.filters = {
        status: "all",
        dateRange: {
          start: "",
          end: "",
        },
        search: "",
      };
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
      };
    },
  },
});

export const {
  setSelectedOrder,
  setLoading,
  setError,
  clearError,
  setStatusFilter,
  setDateRangeFilter,
  setSearchFilter,
  clearFilters,
  setPagination,
  resetOrdersState,
} = ordersSlice.actions;

export default ordersSlice.reducer;
