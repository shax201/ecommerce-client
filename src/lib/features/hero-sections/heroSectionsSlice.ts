import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HeroSectionData } from './heroSectionsApi';

interface HeroSectionsState {
  heroSections: HeroSectionData[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  selectedItems: Set<string>;
  isBulkOperating: boolean;
}

const initialState: HeroSectionsState = {
  heroSections: [],
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
  selectedItems: new Set(),
  isBulkOperating: false,
};

const heroSectionsSlice = createSlice({
  name: 'heroSections',
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

    // Set hero sections data
    setHeroSections: (state, action: PayloadAction<HeroSectionData[]>) => {
      state.heroSections = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
    },

    // Add a single hero section
    addHeroSection: (state, action: PayloadAction<HeroSectionData>) => {
      const existingIndex = state.heroSections.findIndex(hero => hero._id === action.payload._id);
      if (existingIndex >= 0) {
        state.heroSections[existingIndex] = action.payload;
      } else {
        state.heroSections.push(action.payload);
      }
    },

    // Update a single hero section
    updateHeroSection: (state, action: PayloadAction<HeroSectionData>) => {
      const index = state.heroSections.findIndex(hero => hero._id === action.payload._id);
      if (index >= 0) {
        state.heroSections[index] = action.payload;
      }
    },

    // Remove a hero section
    removeHeroSection: (state, action: PayloadAction<string>) => {
      state.heroSections = state.heroSections.filter(hero => hero._id !== action.payload);
      state.selectedItems.delete(action.payload);
    },

    // Remove multiple hero sections
    removeHeroSections: (state, action: PayloadAction<string[]>) => {
      state.heroSections = state.heroSections.filter(hero => !action.payload.includes(hero._id));
      action.payload.forEach(id => state.selectedItems.delete(id));
    },

    // Clear all hero sections
    clearHeroSections: (state) => {
      state.heroSections = [];
      state.lastFetch = null;
      state.error = null;
      state.selectedItems.clear();
    },

    // Reset state
    resetHeroSectionsState: (state) => {
      return initialState;
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>) => {
      state.pagination = action.payload;
    },

    // Selection management
    selectHeroSection: (state, action: PayloadAction<string>) => {
      state.selectedItems.add(action.payload);
    },

    deselectHeroSection: (state, action: PayloadAction<string>) => {
      state.selectedItems.delete(action.payload);
    },

    selectAllHeroSectionsAction: (state) => {
      state.selectedItems = new Set(state.heroSections.map(hero => hero._id));
    },

    clearSelection: (state) => {
      state.selectedItems.clear();
    },

    // Bulk operations
    setBulkOperating: (state, action: PayloadAction<boolean>) => {
      state.isBulkOperating = action.payload;
    },

    // Reorder hero sections
    reorderHeroSections: (state, action: PayloadAction<{ id: string; order: number }[]>) => {
      const updates = action.payload;
      updates.forEach(({ id, order }) => {
        const hero = state.heroSections.find(h => h._id === id);
        if (hero) {
          hero.order = order;
        }
      });
      // Sort by order
      state.heroSections.sort((a, b) => a.order - b.order);
    },

    // Bulk update hero sections
    bulkUpdateHeroSections: (state, action: PayloadAction<{ ids: string[]; updates: Partial<HeroSectionData> }>) => {
      const { ids, updates } = action.payload;
      state.heroSections.forEach(hero => {
        if (ids.includes(hero._id)) {
          Object.assign(hero, updates);
        }
      });
    },
  },
});

export const {
  setLoading,
  setError,
  setHeroSections,
  addHeroSection,
  updateHeroSection,
  removeHeroSection,
  removeHeroSections,
  clearHeroSections,
  resetHeroSectionsState,
  setPagination,
  selectHeroSection,
  deselectHeroSection,
  selectAllHeroSectionsAction,
  clearSelection,
  setBulkOperating,
  reorderHeroSections,
  bulkUpdateHeroSections,
} = heroSectionsSlice.actions;

export default heroSectionsSlice.reducer;

// Selectors
export const selectAllHeroSectionsData = (state: { heroSections: HeroSectionsState }) => state.heroSections.heroSections;
export const selectHeroSectionsLoading = (state: { heroSections: HeroSectionsState }) => state.heroSections.loading;
export const selectHeroSectionsError = (state: { heroSections: HeroSectionsState }) => state.heroSections.error;
export const selectHeroSectionsLastFetch = (state: { heroSections: HeroSectionsState }) => state.heroSections.lastFetch;
export const selectHeroSectionsPagination = (state: { heroSections: HeroSectionsState }) => state.heroSections.pagination;
export const selectHeroSectionById = (state: { heroSections: HeroSectionsState }, id: string) => 
  state.heroSections.heroSections.find(hero => hero._id === id);
export const selectActiveHeroSections = (state: { heroSections: HeroSectionsState }) => 
  state.heroSections.heroSections.filter(hero => hero.isActive);
export const selectSelectedHeroSections = (state: { heroSections: HeroSectionsState }) => 
  state.heroSections.heroSections.filter(hero => state.heroSections.selectedItems.has(hero._id));
export const selectSelectedItems = (state: { heroSections: HeroSectionsState }) => state.heroSections.selectedItems;
export const selectIsBulkOperating = (state: { heroSections: HeroSectionsState }) => state.heroSections.isBulkOperating;
export const selectHeroSectionsByOrder = (state: { heroSections: HeroSectionsState }) => 
  [...state.heroSections.heroSections].sort((a, b) => a.order - b.order);
