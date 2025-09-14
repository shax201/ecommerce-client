import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coupon } from "@/types/coupon.types";

// ===== STATE INTERFACE =====

interface CouponsState {
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCoupons: number;

  // Filters
  searchQuery: string;
  isActiveFilter: boolean | null;

  // UI State
  selectedCoupons: string[];
  isBulkOperationLoading: boolean;

  // Form State
  isAddFormOpen: boolean;
  isEditFormOpen: boolean;
  editingCouponId: string | null;

  // Validation State
  validationResult: {
    isValid: boolean;
    error?: string;
    discountAmount?: number;
    finalAmount?: number;
  } | null;
}

// ===== INITIAL STATE =====

const initialState: CouponsState = {
  // Pagination
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalCoupons: 0,

  // Filters
  searchQuery: "",
  isActiveFilter: null,

  // UI State
  selectedCoupons: [],
  isBulkOperationLoading: false,

  // Form State
  isAddFormOpen: false,
  isEditFormOpen: false,
  editingCouponId: null,

  // Validation State
  validationResult: null,
};

// ===== SLICE =====

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },
    setTotalCoupons: (state, action: PayloadAction<number>) => {
      state.totalCoupons = action.payload;
    },

    // Filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },
    setIsActiveFilter: (state, action: PayloadAction<boolean | null>) => {
      state.isActiveFilter = action.payload;
      state.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.searchQuery = "";
      state.isActiveFilter = null;
      state.currentPage = 1;
    },

    // Selection actions
    toggleCouponSelection: (state, action: PayloadAction<string>) => {
      const couponId = action.payload;
      const index = state.selectedCoupons.indexOf(couponId);
      if (index > -1) {
        state.selectedCoupons.splice(index, 1);
      } else {
        state.selectedCoupons.push(couponId);
      }
    },
    selectAllCoupons: (state, action: PayloadAction<string[]>) => {
      state.selectedCoupons = action.payload;
    },
    clearSelection: (state) => {
      state.selectedCoupons = [];
    },

    // Bulk operation actions
    setBulkOperationLoading: (state, action: PayloadAction<boolean>) => {
      state.isBulkOperationLoading = action.payload;
    },

    // Form actions
    openAddForm: (state) => {
      state.isAddFormOpen = true;
      state.isEditFormOpen = false;
      state.editingCouponId = null;
    },
    closeAddForm: (state) => {
      state.isAddFormOpen = false;
    },
    openEditForm: (state, action: PayloadAction<string>) => {
      state.isEditFormOpen = true;
      state.isAddFormOpen = false;
      state.editingCouponId = action.payload;
    },
    closeEditForm: (state) => {
      state.isEditFormOpen = false;
      state.editingCouponId = null;
    },
    closeAllForms: (state) => {
      state.isAddFormOpen = false;
      state.isEditFormOpen = false;
      state.editingCouponId = null;
    },

    // Validation actions
    setValidationResult: (state, action: PayloadAction<{
      isValid: boolean;
      error?: string;
      discountAmount?: number;
      finalAmount?: number;
    } | null>) => {
      state.validationResult = action.payload;
    },
    clearValidationResult: (state) => {
      state.validationResult = null;
    },

    // Reset actions
    resetCouponsState: () => initialState,
  },
});

// ===== EXPORTED ACTIONS =====

export const {
  // Pagination
  setCurrentPage,
  setPageSize,
  setTotalPages,
  setTotalCoupons,

  // Filters
  setSearchQuery,
  setIsActiveFilter,
  clearFilters,

  // Selection
  toggleCouponSelection,
  selectAllCoupons,
  clearSelection,

  // Bulk operations
  setBulkOperationLoading,

  // Forms
  openAddForm,
  closeAddForm,
  openEditForm,
  closeEditForm,
  closeAllForms,

  // Validation
  setValidationResult,
  clearValidationResult,

  // Reset
  resetCouponsState,
} = couponsSlice.actions;

// ===== SELECTORS =====

export const selectCurrentPage = (state: { coupons: CouponsState }) => state.coupons.currentPage;
export const selectPageSize = (state: { coupons: CouponsState }) => state.coupons.pageSize;
export const selectTotalPages = (state: { coupons: CouponsState }) => state.coupons.totalPages;
export const selectTotalCoupons = (state: { coupons: CouponsState }) => state.coupons.totalCoupons;

export const selectSearchQuery = (state: { coupons: CouponsState }) => state.coupons.searchQuery;
export const selectIsActiveFilter = (state: { coupons: CouponsState }) => state.coupons.isActiveFilter;

export const selectSelectedCoupons = (state: { coupons: CouponsState }) => state.coupons.selectedCoupons;
export const selectIsBulkOperationLoading = (state: { coupons: CouponsState }) => state.coupons.isBulkOperationLoading;

export const selectIsAddFormOpen = (state: { coupons: CouponsState }) => state.coupons.isAddFormOpen;
export const selectIsEditFormOpen = (state: { coupons: CouponsState }) => state.coupons.isEditFormOpen;
export const selectEditingCouponId = (state: { coupons: CouponsState }) => state.coupons.editingCouponId;

export const selectValidationResult = (state: { coupons: CouponsState }) => state.coupons.validationResult;

// ===== REDUCER =====

export default couponsSlice.reducer;
