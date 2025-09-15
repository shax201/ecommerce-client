import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ColorData } from "./colorsApi";
import { SizeData } from "./sizesApi";

interface AttributesState {
  // UI State
  selectedColors: string[];
  selectedSizes: string[];
  isBulkDeleteMode: boolean;
  searchQuery: string;
  
  // Filter State
  colorFilter: string;
  sizeFilter: string;
  
  // Pagination State
  currentPage: number;
  pageSize: number;
  
  // Selection State
  selectedColorIds: string[];
  selectedSizeIds: string[];
}

const initialState: AttributesState = {
  selectedColors: [],
  selectedSizes: [],
  isBulkDeleteMode: false,
  searchQuery: "",
  colorFilter: "",
  sizeFilter: "",
  currentPage: 1,
  pageSize: 10,
  selectedColorIds: [],
  selectedSizeIds: [],
};

export const attributesSlice = createSlice({
  name: "attributes",
  initialState,
  reducers: {
    // Color selection
    setSelectedColors: (state, action: PayloadAction<string[]>) => {
      state.selectedColors = action.payload;
    },
    addSelectedColor: (state, action: PayloadAction<string>) => {
      if (!state.selectedColors.includes(action.payload)) {
        state.selectedColors.push(action.payload);
      }
    },
    removeSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColors = state.selectedColors.filter(
        (color) => color !== action.payload
      );
    },
    clearSelectedColors: (state) => {
      state.selectedColors = [];
    },

    // Size selection
    setSelectedSizes: (state, action: PayloadAction<string[]>) => {
      state.selectedSizes = action.payload;
    },
    addSelectedSize: (state, action: PayloadAction<string>) => {
      if (!state.selectedSizes.includes(action.payload)) {
        state.selectedSizes.push(action.payload);
      }
    },
    removeSelectedSize: (state, action: PayloadAction<string>) => {
      state.selectedSizes = state.selectedSizes.filter(
        (size) => size !== action.payload
      );
    },
    clearSelectedSizes: (state) => {
      state.selectedSizes = [];
    },

    // UI State
    setBulkDeleteMode: (state, action: PayloadAction<boolean>) => {
      state.isBulkDeleteMode = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Filter State
    setColorFilter: (state, action: PayloadAction<string>) => {
      state.colorFilter = action.payload;
    },
    setSizeFilter: (state, action: PayloadAction<string>) => {
      state.sizeFilter = action.payload;
    },
    clearFilters: (state) => {
      state.colorFilter = "";
      state.sizeFilter = "";
      state.searchQuery = "";
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },

    // Selection for bulk operations
    setSelectedColorIds: (state, action: PayloadAction<string[]>) => {
      state.selectedColorIds = action.payload;
    },
    addSelectedColorId: (state, action: PayloadAction<string>) => {
      if (!state.selectedColorIds.includes(action.payload)) {
        state.selectedColorIds.push(action.payload);
      }
    },
    removeSelectedColorId: (state, action: PayloadAction<string>) => {
      state.selectedColorIds = state.selectedColorIds.filter(
        (id) => id !== action.payload
      );
    },
    clearSelectedColorIds: (state) => {
      state.selectedColorIds = [];
    },

    setSelectedSizeIds: (state, action: PayloadAction<string[]>) => {
      state.selectedSizeIds = action.payload;
    },
    addSelectedSizeId: (state, action: PayloadAction<string>) => {
      if (!state.selectedSizeIds.includes(action.payload)) {
        state.selectedSizeIds.push(action.payload);
      }
    },
    removeSelectedSizeId: (state, action: PayloadAction<string>) => {
      state.selectedSizeIds = state.selectedSizeIds.filter(
        (id) => id !== action.payload
      );
    },
    clearSelectedSizeIds: (state) => {
      state.selectedSizeIds = [];
    },

    // Reset all state
    resetAttributesState: () => initialState,
  },
});

export const {
  // Color selection
  setSelectedColors,
  addSelectedColor,
  removeSelectedColor,
  clearSelectedColors,

  // Size selection
  setSelectedSizes,
  addSelectedSize,
  removeSelectedSize,
  clearSelectedSizes,

  // UI State
  setBulkDeleteMode,
  setSearchQuery,

  // Filter State
  setColorFilter,
  setSizeFilter,
  clearFilters,

  // Pagination
  setCurrentPage,
  setPageSize,

  // Selection for bulk operations
  setSelectedColorIds,
  addSelectedColorId,
  removeSelectedColorId,
  clearSelectedColorIds,

  setSelectedSizeIds,
  addSelectedSizeId,
  removeSelectedSizeId,
  clearSelectedSizeIds,

  // Reset
  resetAttributesState,
} = attributesSlice.actions;

export const attributesReducer = attributesSlice.reducer;
export default attributesSlice.reducer;
