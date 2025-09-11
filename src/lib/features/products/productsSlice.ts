import { Product } from "@/types/product.types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { set, string } from "zod";

export type Color = {
  name: string;
  code: string;
};

const initProduct: Product = {
  id: 1,
  discount: {
    amount: 1,
    percentage: 10,
  },
  price: 1,
  rating: 5,
  primaryImage: "",
  catagory: "",
  description: "",
  discountPrice: 1,
  optionalImages: [""],
  regularPrice: 1,
  title: "",
  gallery: [""],
  variants: {
    color: [],
    size: [],
  },
};

// Define a type for the slice state
interface ProductsState {
  colorSelection: Color;
  sizeSelection: string;
  category: string;
  products: Product[];
  minPrice: number;
  isLoadingFilter: boolean;
  maxPrice: number;
  gtmScript: string;
  filteredProducts: Product[];
}

// Define the initial state using that type
const initialState: ProductsState = {
  colorSelection: {
    name: "Brown",
    code: "bg-[#4F4631]",
  },
  category: "",
  gtmScript: "",
  sizeSelection: "Large",
  minPrice: 0,
  maxPrice: 10000,
  products: [initProduct],
  filteredProducts: [],
  isLoadingFilter: true,
};

export const productsSlice = createSlice({
  name: "products",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setColorSelection: (state, action: PayloadAction<Color>) => {
      state.colorSelection = action.payload;
    },
    setSizeSelection: (state, action: PayloadAction<string>) => {
      state.sizeSelection = action.payload;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min: number; max: number }>
    ) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    setGTMScript: (state, action: PayloadAction<string>) => {
      state.gtmScript = action.payload;
    },
    setFilteredProducts: (state, action: PayloadAction<Product[]>) => {
      state.filteredProducts = action.payload;
    },
    setCategories: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setLoadingFilter: (state, action: PayloadAction<boolean>) => {
      state.isLoadingFilter = action.payload;
    },
  },
});

export const {
  setColorSelection,
  setSizeSelection,
  setPriceRange,
  setGTMScript,
  setFilteredProducts,
  setCategories,
  setLoadingFilter,
} = productsSlice.actions;

export default productsSlice.reducer;
