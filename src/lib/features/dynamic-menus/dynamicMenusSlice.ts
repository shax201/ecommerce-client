import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ===== TYPES =====

export interface DynamicMenuData {
  _id?: string;
  name: string;
  description?: string;
  slug: string;
  items: DynamicMenuItemData[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicMenuItemData {
  _id?: string;
  id: number;
  label: string;
  url: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
  isActive: boolean;
  order: number;
  children?: DynamicMenuItemData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicMenuFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DynamicMenuState {
  menus: DynamicMenuData[];
  selectedMenu: DynamicMenuData | null;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  filters: DynamicMenuFilters;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

// ===== INITIAL STATE =====

const initialState: DynamicMenuState = {
  menus: [],
  selectedMenu: null,
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
};

// ===== SLICE =====

const dynamicMenusSlice = createSlice({
  name: "dynamicMenus",
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

    // Set menus data
    setMenus: (state, action: PayloadAction<DynamicMenuData[]>) => {
      state.menus = action.payload;
      state.lastFetch = Date.now();
    },

    // Add single menu
    addMenu: (state, action: PayloadAction<DynamicMenuData>) => {
      state.menus.unshift(action.payload);
    },

    // Update single menu
    updateMenu: (state, action: PayloadAction<DynamicMenuData>) => {
      const index = state.menus.findIndex(menu => menu._id === action.payload._id);
      if (index !== -1) {
        state.menus[index] = action.payload;
      }
    },

    // Remove single menu
    removeMenu: (state, action: PayloadAction<string>) => {
      state.menus = state.menus.filter(menu => menu._id !== action.payload);
    },

    // Set selected menu
    setSelectedMenu: (state, action: PayloadAction<DynamicMenuData | null>) => {
      state.selectedMenu = action.payload;
    },

    // Update selected menu items
    updateSelectedMenuItems: (state, action: PayloadAction<DynamicMenuItemData[]>) => {
      if (state.selectedMenu) {
        state.selectedMenu.items = action.payload;
      }
    },

    // Add item to selected menu
    addItemToSelectedMenu: (state, action: PayloadAction<DynamicMenuItemData>) => {
      if (state.selectedMenu) {
        state.selectedMenu.items.push(action.payload);
      }
    },

    // Update item in selected menu
    updateItemInSelectedMenu: (state, action: PayloadAction<DynamicMenuItemData>) => {
      if (state.selectedMenu) {
        const index = state.selectedMenu.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.selectedMenu.items[index] = action.payload;
        }
      }
    },

    // Remove item from selected menu
    removeItemFromSelectedMenu: (state, action: PayloadAction<number>) => {
      if (state.selectedMenu) {
        state.selectedMenu.items = state.selectedMenu.items.filter(item => item.id !== action.payload);
      }
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
    setFilters: (state, action: PayloadAction<DynamicMenuFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear all data
    clearData: (state) => {
      state.menus = [];
      state.selectedMenu = null;
      state.pagination = {
        total: 0,
        page: 1,
        totalPages: 1,
      };
      state.error = null;
      state.lastFetch = null;
    },

    // Reset to initial state
    reset: () => initialState,
  },
});

// ===== EXPORTS =====

export const {
  setLoading,
  setError,
  setMenus,
  addMenu,
  updateMenu,
  removeMenu,
  setSelectedMenu,
  updateSelectedMenuItems,
  addItemToSelectedMenu,
  updateItemInSelectedMenu,
  removeItemFromSelectedMenu,
  setPagination,
  setFilters,
  clearData,
  reset,
} = dynamicMenusSlice.actions;

export default dynamicMenusSlice.reducer;

// ===== SELECTORS =====

export const selectDynamicMenus = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.menus;
export const selectSelectedMenu = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.selectedMenu;
export const selectDynamicMenusPagination = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.pagination;
export const selectDynamicMenusFilters = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.filters;
export const selectDynamicMenusLoading = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.loading;
export const selectDynamicMenusError = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.error;
export const selectDynamicMenusLastFetch = (state: { dynamicMenus: DynamicMenuState }) => state.dynamicMenus.lastFetch;
