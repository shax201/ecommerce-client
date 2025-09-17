import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ===== TYPES =====

export interface ClientLogoData {
  _id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  altText: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientLogoFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ClientLogoState {
  logos: ClientLogoData[];
  selectedLogos: Set<string>;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  filters: ClientLogoFilters;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  editingField: { id: string; field: string } | null;
  editingValue: string;
}

// ===== INITIAL STATE =====

const initialState: ClientLogoState = {
  logos: [],
  selectedLogos: new Set(),
  pagination: {
    total: 0,
    page: 1,
    totalPages: 1,
  },
  filters: {
    page: 1,
    limit: 10,
  },
  loading: false,
  error: null,
  lastFetch: null,
  editingField: null,
  editingValue: "",
};

// ===== SLICE =====

const clientLogosSlice = createSlice({
  name: "clientLogos",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set logos data
    setLogos: (state, action: PayloadAction<ClientLogoData[]>) => {
      state.logos = action.payload;
      state.lastFetch = Date.now();
    },

    // Add single logo
    addLogo: (state, action: PayloadAction<ClientLogoData>) => {
      state.logos.unshift(action.payload);
    },

    // Update single logo
    updateLogo: (state, action: PayloadAction<ClientLogoData>) => {
      const index = state.logos.findIndex(logo => logo._id === action.payload._id);
      if (index !== -1) {
        state.logos[index] = action.payload;
      }
    },

    // Remove single logo
    removeLogo: (state, action: PayloadAction<string>) => {
      state.logos = state.logos.filter(logo => logo._id !== action.payload);
      state.selectedLogos.delete(action.payload);
    },

    // Remove multiple logos
    removeLogos: (state, action: PayloadAction<string[]>) => {
      state.logos = state.logos.filter(logo => !action.payload.includes(logo._id));
      action.payload.forEach(id => state.selectedLogos.delete(id));
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{
      total: number;
      page: number;
      totalPages: number;
    }>) => {
      state.pagination = action.payload;
    },

    // Set filters
    setFilters: (state, action: PayloadAction<ClientLogoFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Selection management
    selectLogo: (state, action: PayloadAction<string>) => {
      state.selectedLogos.add(action.payload);
    },

    deselectLogo: (state, action: PayloadAction<string>) => {
      state.selectedLogos.delete(action.payload);
    },

    selectAllLogos: (state) => {
      state.selectedLogos = new Set(state.logos.map(logo => logo._id));
    },

    clearSelection: (state) => {
      state.selectedLogos.clear();
    },

    toggleLogoSelection: (state, action: PayloadAction<string>) => {
      if (state.selectedLogos.has(action.payload)) {
        state.selectedLogos.delete(action.payload);
      } else {
        state.selectedLogos.add(action.payload);
      }
    },

    // Inline editing
    startInlineEdit: (state, action: PayloadAction<{ id: string; field: string; value: string }>) => {
      state.editingField = { id: action.payload.id, field: action.payload.field };
      state.editingValue = action.payload.value;
    },

    updateEditingValue: (state, action: PayloadAction<string>) => {
      state.editingValue = action.payload;
    },

    cancelInlineEdit: (state) => {
      state.editingField = null;
      state.editingValue = "";
    },

    // Reorder logos
    reorderLogos: (state, action: PayloadAction<ClientLogoData[]>) => {
      state.logos = action.payload;
    },

    // Clear all data
    clearData: (state) => {
      state.logos = [];
      state.selectedLogos.clear();
      state.pagination = {
        total: 0,
        page: 1,
        totalPages: 1,
      };
      state.error = null;
      state.lastFetch = null;
      state.editingField = null;
      state.editingValue = "";
    },

    // Reset to initial state
    reset: () => initialState,
  },
});

// ===== EXPORTS =====

export const {
  setLoading,
  setError,
  setLogos,
  addLogo,
  updateLogo,
  removeLogo,
  removeLogos,
  setPagination,
  setFilters,
  selectLogo,
  deselectLogo,
  selectAllLogos,
  clearSelection,
  toggleLogoSelection,
  startInlineEdit,
  updateEditingValue,
  cancelInlineEdit,
  reorderLogos,
  clearData,
  reset,
} = clientLogosSlice.actions;

export default clientLogosSlice.reducer;

// ===== SELECTORS =====

export const selectClientLogos = (state: { clientLogos: ClientLogoState }) => state.clientLogos.logos;
export const selectSelectedLogos = (state: { clientLogos: ClientLogoState }) => state.clientLogos.selectedLogos;
export const selectClientLogosPagination = (state: { clientLogos: ClientLogoState }) => state.clientLogos.pagination;
export const selectClientLogosFilters = (state: { clientLogos: ClientLogoState }) => state.clientLogos.filters;
export const selectClientLogosLoading = (state: { clientLogos: ClientLogoState }) => state.clientLogos.loading;
export const selectClientLogosError = (state: { clientLogos: ClientLogoState }) => state.clientLogos.error;
export const selectClientLogosLastFetch = (state: { clientLogos: ClientLogoState }) => state.clientLogos.lastFetch;
export const selectEditingField = (state: { clientLogos: ClientLogoState }) => state.clientLogos.editingField;
export const selectEditingValue = (state: { clientLogos: ClientLogoState }) => state.clientLogos.editingValue;
