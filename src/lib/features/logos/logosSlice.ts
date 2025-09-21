import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LogoData } from './logosApi';

interface LogosState {
  logos: LogoData[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: LogosState = {
  logos: [],
  loading: false,
  error: null,
  lastFetch: null,
};

const logosSlice = createSlice({
  name: 'logos',
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
    setLogos: (state, action: PayloadAction<LogoData[]>) => {
      state.logos = action.payload;
      state.lastFetch = Date.now();
      state.error = null;
    },

    // Add a single logo
    addLogo: (state, action: PayloadAction<LogoData>) => {
      const existingIndex = state.logos.findIndex(logo => logo.id === action.payload.id);
      if (existingIndex >= 0) {
        state.logos[existingIndex] = action.payload;
      } else {
        state.logos.push(action.payload);
      }
    },

    // Update a single logo
    updateLogo: (state, action: PayloadAction<LogoData>) => {
      const index = state.logos.findIndex(logo => logo.id === action.payload.id);
      if (index >= 0) {
        state.logos[index] = action.payload;
      }
    },

    // Remove a logo
    removeLogo: (state, action: PayloadAction<string>) => {
      state.logos = state.logos.filter(logo => logo.id !== action.payload);
    },

    // Clear all logos
    clearLogos: (state) => {
      state.logos = [];
      state.lastFetch = null;
      state.error = null;
    },

    // Reset state
    resetLogosState: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  setLogos,
  addLogo,
  updateLogo,
  removeLogo,
  clearLogos,
  resetLogosState,
} = logosSlice.actions;

export default logosSlice.reducer;

// Selectors
export const selectAllLogos = (state: { logos: LogosState }) => state.logos.logos;
export const selectLogosLoading = (state: { logos: LogosState }) => state.logos.loading;
export const selectLogosError = (state: { logos: LogosState }) => state.logos.error;
export const selectLogosLastFetch = (state: { logos: LogosState }) => state.logos.lastFetch;
export const selectLogoById = (state: { logos: LogosState }, id: string) => 
  state.logos.logos.find(logo => logo.id === id);
export const selectActiveLogos = (state: { logos: LogosState }) => 
  state.logos.logos.filter(logo => logo.isActive);
export const selectLogosByType = (state: { logos: LogosState }, type: 'main' | 'footer' | 'favicon') => 
  state.logos.logos.filter(logo => logo.type === type);

// Favicon-specific selectors
export const selectFavicon = (state: { logos: LogosState }) => 
  state.logos.logos.find(logo => logo.type === 'favicon' && logo.isActive);

export const selectFaviconLoading = (state: { logos: LogosState }) => state.logos.loading;
export const selectFaviconError = (state: { logos: LogosState }) => state.logos.error;