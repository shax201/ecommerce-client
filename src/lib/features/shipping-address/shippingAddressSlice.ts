import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShippingAddress } from "./shippingAddressApi";

interface ShippingAddressState {
  selectedAddress: ShippingAddress | null;
  isAddressModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShippingAddressState = {
  selectedAddress: null,
  isAddressModalOpen: false,
  isLoading: false,
  error: null,
};

const shippingAddressSlice = createSlice({
  name: "shippingAddress",
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<ShippingAddress | null>) => {
      state.selectedAddress = action.payload;
    },
    setAddressModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddressModalOpen = action.payload;
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
    resetShippingAddressState: (state) => {
      state.selectedAddress = null;
      state.isAddressModalOpen = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setSelectedAddress,
  setAddressModalOpen,
  setLoading,
  setError,
  clearError,
  resetShippingAddressState,
} = shippingAddressSlice.actions;

export default shippingAddressSlice.reducer;
