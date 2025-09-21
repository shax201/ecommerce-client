import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CategoryData {
  _id: string;
  title: string;
  description: string;
  parent: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  productCount?: number;
}

interface CategoriesState {
  categories: CategoryData[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  selectedCategories: string[];
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  lastFetch: null,
  selectedCategories: [],
};

const categoriesSlice = createSlice({
  name: 'categories',
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

    // Set categories data
    setCategories: (state, action: PayloadAction<CategoryData[]>) => {
      state.categories = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
    },

    // Add a single category
    addCategory: (state, action: PayloadAction<CategoryData>) => {
      const existingIndex = state.categories.findIndex((category: CategoryData) => category._id === action.payload._id);
      if (existingIndex >= 0) {
        state.categories[existingIndex] = action.payload;
      } else {
        state.categories.push(action.payload);
      }
    },

    // Update a single category
    updateCategory: (state, action: PayloadAction<CategoryData>) => {
      const index = state.categories.findIndex((category: CategoryData) => category._id === action.payload._id);
      if (index >= 0) {
        state.categories[index] = action.payload;
      }
    },

    // Remove a category
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((category: CategoryData) => category._id !== action.payload);
    },

    // Remove multiple categories
    removeCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = state.categories.filter((category: CategoryData) => !action.payload.includes(category._id));
    },

    // Set selected categories
    setSelectedCategories: (state, action: PayloadAction<string[]>) => {
      state.selectedCategories = action.payload;
    },

    // Toggle category selection
    toggleCategorySelection: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      const index = state.selectedCategories.indexOf(categoryId);
      if (index >= 0) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(categoryId);
      }
    },

    // Clear all selections
    clearSelections: (state) => {
      state.selectedCategories = [];
    },

    // Clear all categories
    clearCategories: (state) => {
      state.categories = [];
      state.lastFetch = null;
      state.error = null;
      state.selectedCategories = [];
    },

    // Reset state
    resetCategoriesState: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  removeCategories,
  setSelectedCategories,
  toggleCategorySelection,
  clearSelections,
  clearCategories,
  resetCategoriesState,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;

// Selectors
export const selectAllCategories = (state: { categories: CategoriesState }) => state.categories.categories;
export const selectCategoriesLoading = (state: { categories: CategoriesState }) => state.categories.loading;
export const selectCategoriesError = (state: { categories: CategoriesState }) => state.categories.error;
export const selectCategoriesLastFetch = (state: { categories: CategoriesState }) => state.categories.lastFetch;
export const selectSelectedCategories = (state: { categories: CategoriesState }) => state.categories.selectedCategories;
export const selectCategoryById = (state: { categories: CategoriesState }, id: string) => 
  state.categories.categories.find(category => category._id === id);
export const selectParentCategories = (state: { categories: CategoriesState }) => 
  state.categories.categories.filter(category => category.parent === null);
export const selectSubCategories = (state: { categories: CategoriesState }, parentId: string) => 
  state.categories.categories.filter(category => category.parent === parentId);
export const selectCategoriesWithProductCounts = (state: { categories: CategoriesState }) => 
  state.categories.categories.map(category => ({
    ...category,
    productCount: category.productCount || 0
  }));
