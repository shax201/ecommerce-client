import { Product } from "@/types/product.types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// ===== TYPES =====
export type Color = {
  name: string;
  code: string;
};

export type Size = {
  id: string;
  size: string;
};

export type ProductFilters = {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  categories?: string[];
  status?: string[];
  featured?: boolean;
  search?: string;
  inStock?: boolean;
  rating?: number;
};

// Define a type for the slice state
interface ProductsState {
  // UI State
  colorSelection: Color;
  sizeSelection: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  isLoadingFilter: boolean;
  gtmScript: string;
  
  // Product Data (for local filtering/caching)
  products: Product[];
  filteredProducts: Product[];
  
  // Current filters applied
  currentFilters: ProductFilters;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  
  // Search state
  searchQuery: string;
  
  // View preferences
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Define the initial state using that type
const initialState: ProductsState = {
  // UI State
  colorSelection: {
    name: "Brown",
    code: "bg-[#4F4631]",
  },
  sizeSelection: "Large",
  category: "",
  minPrice: 0,
  maxPrice: 10000,
  isLoadingFilter: false,
  gtmScript: "",
  
  // Product Data
  products: [],
  filteredProducts: [],
  
  // Current filters
  currentFilters: {},
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  
  // Search
  searchQuery: "",
  
  // View preferences
  viewMode: 'grid',
  sortBy: 'popularity',
  sortOrder: 'desc',
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // ===== UI STATE ACTIONS =====
    setColorSelection: (state, action: PayloadAction<Color>) => {
      state.colorSelection = action.payload;
    },
    
    setSizeSelection: (state, action: PayloadAction<string>) => {
      state.sizeSelection = action.payload;
    },
    
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    
    setGTMScript: (state, action: PayloadAction<string>) => {
      state.gtmScript = action.payload;
    },
    
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    
    setLoadingFilter: (state, action: PayloadAction<boolean>) => {
      state.isLoadingFilter = action.payload;
    },
    
    // ===== PRODUCT DATA ACTIONS =====
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    
    setFilteredProducts: (state, action: PayloadAction<Product[]>) => {
      state.filteredProducts = action.payload;
    },
    
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    
    updateProduct: (state, action: PayloadAction<{ id: string | number; updates: Partial<Product> }>) => {
      const { id, updates } = action.payload;
      const index = state.products.findIndex(product => product.id === id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updates };
      }
    },
    
    removeProduct: (state, action: PayloadAction<string | number>) => {
      state.products = state.products.filter(product => product.id !== action.payload);
      state.filteredProducts = state.filteredProducts.filter(product => product.id !== action.payload);
    },
    
    // ===== FILTER ACTIONS =====
    setCurrentFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.currentFilters = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.currentFilters = {};
      state.minPrice = 0;
      state.maxPrice = 10000;
      state.category = "";
      state.searchQuery = "";
    },
    
    // ===== PAGINATION ACTIONS =====
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setPagination: (state, action: PayloadAction<{
      page: number;
      totalPages: number;
      total: number;
    }>) => {
      state.currentPage = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.totalProducts = action.payload.total;
    },
    
    // ===== SEARCH ACTIONS =====
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearSearch: (state) => {
      state.searchQuery = "";
    },
    
    // ===== VIEW PREFERENCES =====
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    
    // ===== UTILITY ACTIONS =====
    resetProductsState: (state) => {
      return { ...initialState };
    },
    
    // Apply local filtering (for client-side filtering)
    applyLocalFilters: (state) => {
      let filtered = [...state.products];
      
      // Filter by category
      if (state.category) {
        filtered = filtered.filter(product => 
          product.catagory?.toLowerCase().includes(state.category.toLowerCase())
        );
      }
      
      // Filter by price range
      filtered = filtered.filter(product => 
        product.price >= state.minPrice && product.price <= state.maxPrice
      );
      
      // Filter by search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }
      
      // Sort products
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (state.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'rating':
            comparison = (b.rating || 0) - (a.rating || 0);
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'createdAt':
            comparison = new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
            break;
          default:
            comparison = 0;
        }
        
        return state.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      state.filteredProducts = filtered;
    },
  },
});

// ===== EXPORTED ACTIONS =====
export const {
  // UI State
  setColorSelection,
  setSizeSelection,
  setPriceRange,
  setGTMScript,
  setCategory,
  setLoadingFilter,
  
  // Product Data
  setProducts,
  setFilteredProducts,
  addProduct,
  updateProduct,
  removeProduct,
  
  // Filters
  setCurrentFilters,
  updateFilters,
  clearFilters,
  
  // Pagination
  setCurrentPage,
  setPagination,
  
  // Search
  setSearchQuery,
  clearSearch,
  
  // View Preferences
  setViewMode,
  setSortBy,
  setSortOrder,
  
  // Utility
  resetProductsState,
  applyLocalFilters,
} = productsSlice.actions;

// ===== SELECTORS =====
export const selectProducts = (state: { products: ProductsState }) => state.products.products;
export const selectFilteredProducts = (state: { products: ProductsState }) => state.products.filteredProducts;
export const selectCurrentFilters = (state: { products: ProductsState }) => state.products.currentFilters;
export const selectPagination = (state: { products: ProductsState }) => ({
  currentPage: state.products.currentPage,
  totalPages: state.products.totalPages,
  totalProducts: state.products.totalProducts,
});
export const selectSearchQuery = (state: { products: ProductsState }) => state.products.searchQuery;
export const selectViewMode = (state: { products: ProductsState }) => state.products.viewMode;
export const selectSortBy = (state: { products: ProductsState }) => state.products.sortBy;
export const selectSortOrder = (state: { products: ProductsState }) => state.products.sortOrder;
export const selectIsLoadingFilter = (state: { products: ProductsState }) => state.products.isLoadingFilter;

export default productsSlice.reducer;
