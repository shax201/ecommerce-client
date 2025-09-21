import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ===== TYPES =====

export interface NavbarMenuItem {
  id: number;
  label: string;
  url: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface NavbarMenu {
  id: number;
  label: string;
  type: "MenuItem" | "MenuList";
  url?: string;
  children?: NavbarMenuItem[];
  isActive?: boolean;
  order?: number;
}

export interface NavbarData {
  menus: NavbarMenu[];
  isActive?: boolean;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavbarState {
  // Data
  navbarData: NavbarData | null;
  menus: NavbarMenu[];
  logo: {
    url: string;
    altText: string;
    name: string;
  } | null;

  // Loading states
  isLoading: boolean;
  isMenuLoading: boolean;
  isLogoLoading: boolean;

  // Error states
  error: string | null;
  menuError: string | null;
  logoError: string | null;

  // UI states
  isMenuOpen: boolean;
  activeMenuId: number | null;

  // Performance metrics
  lastFetched: number | null;
  dataSource: {
    navbarFromServer: boolean;
    navbarFromClient: boolean;
    menusFromServer: boolean;
    menusFromClient: boolean;
    logoFromServer: boolean;
    logoFromClient: boolean;
  };

  // Cache management
  cache: {
    navbar: NavbarData | null;
    menus: NavbarMenu[];
    logo: {
      url: string;
      altText: string;
      name: string;
    } | null;
    timestamp: number | null;
  };
}

// ===== INITIAL STATE =====

const initialState: NavbarState = {
  // Data
  navbarData: null,
  menus: [],
  logo: null,

  // Loading states
  isLoading: false,
  isMenuLoading: false,
  isLogoLoading: false,

  // Error states
  error: null,
  menuError: null,
  logoError: null,

  // UI states
  isMenuOpen: false,
  activeMenuId: null,

  // Performance metrics
  lastFetched: null,
  dataSource: {
    navbarFromServer: false,
    navbarFromClient: false,
    menusFromServer: false,
    menusFromClient: false,
    logoFromServer: false,
    logoFromClient: false,
  },

  // Cache management
  cache: {
    navbar: null,
    menus: [],
    logo: null,
    timestamp: null,
  },
};

// ===== SLICE =====

const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {
    // Data management
    setNavbarData: (state, action: PayloadAction<NavbarData | null>) => {
      state.navbarData = action.payload;
      state.menus = action.payload?.menus || [];
      state.lastFetched = Date.now();
    },

    setMenus: (state, action: PayloadAction<NavbarMenu[]>) => {
      state.menus = action.payload;
    },

    setLogo: (
      state,
      action: PayloadAction<{
        url: string;
        altText: string;
        name: string;
      } | null>
    ) => {
      state.logo = action.payload;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.isMenuLoading = action.payload;
    },

    setLogoLoading: (state, action: PayloadAction<boolean>) => {
      state.isLogoLoading = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setMenuError: (state, action: PayloadAction<string | null>) => {
      state.menuError = action.payload;
    },

    setLogoError: (state, action: PayloadAction<string | null>) => {
      state.logoError = action.payload;
    },

    clearErrors: (state) => {
      state.error = null;
      state.menuError = null;
      state.logoError = null;
    },

    // UI states
    setMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload;
    },

    setActiveMenuId: (state, action: PayloadAction<number | null>) => {
      state.activeMenuId = action.payload;
    },

    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },

    // Data source tracking
    setDataSource: (
      state,
      action: PayloadAction<{
        navbarFromServer?: boolean;
        navbarFromClient?: boolean;
        menusFromServer?: boolean;
        menusFromClient?: boolean;
        logoFromServer?: boolean;
        logoFromClient?: boolean;
      }>
    ) => {
      state.dataSource = { ...state.dataSource, ...action.payload };
    },

    // Cache management
    setCache: (
      state,
      action: PayloadAction<{
        navbar?: NavbarData | null;
        menus?: NavbarMenu[];
        logo?: {
          url: string;
          altText: string;
          name: string;
        } | null;
        timestamp?: number;
      }>
    ) => {
      if (action.payload.navbar !== undefined) {
        state.cache.navbar = action.payload.navbar;
      }
      if (action.payload.menus !== undefined) {
        state.cache.menus = action.payload.menus;
      }
      if (action.payload.logo !== undefined) {
        state.cache.logo = action.payload.logo;
      }
      if (action.payload.timestamp !== undefined) {
        state.cache.timestamp = action.payload.timestamp;
      }
    },

    clearCache: (state) => {
      state.cache = {
        navbar: null,
        menus: [],
        logo: null,
        timestamp: null,
      };
    },

    // Menu operations
    addMenu: (state, action: PayloadAction<NavbarMenu>) => {
      state.menus.push(action.payload);
    },

    updateMenu: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<NavbarMenu> }>
    ) => {
      const index = state.menus.findIndex((menu) => menu.id === action.payload.id);
      if (index !== -1) {
        state.menus[index] = { ...state.menus[index], ...action.payload.updates };
      }
    },

    deleteMenu: (state, action: PayloadAction<number>) => {
      state.menus = state.menus.filter((menu) => menu.id !== action.payload);
    },

    reorderMenus: (state, action: PayloadAction<NavbarMenu[]>) => {
      state.menus = action.payload;
    },

    // Menu item operations
    addMenuItem: (
      state,
      action: PayloadAction<{ menuId: number; item: NavbarMenuItem }>
    ) => {
      const menu = state.menus.find((m) => m.id === action.payload.menuId);
      if (menu && menu.children) {
        menu.children.push(action.payload.item);
      }
    },

    updateMenuItem: (
      state,
      action: PayloadAction<{
        menuId: number;
        itemId: number;
        updates: Partial<NavbarMenuItem>;
      }>
    ) => {
      const menu = state.menus.find((m) => m.id === action.payload.menuId);
      if (menu && menu.children) {
        const itemIndex = menu.children.findIndex(
          (item) => item.id === action.payload.itemId
        );
        if (itemIndex !== -1) {
          menu.children[itemIndex] = {
            ...menu.children[itemIndex],
            ...action.payload.updates,
          };
        }
      }
    },

    deleteMenuItem: (
      state,
      action: PayloadAction<{ menuId: number; itemId: number }>
    ) => {
      const menu = state.menus.find((m) => m.id === action.payload.menuId);
      if (menu && menu.children) {
        menu.children = menu.children.filter(
          (item) => item.id !== action.payload.itemId
        );
      }
    },

    reorderMenuItems: (
      state,
      action: PayloadAction<{ menuId: number; items: NavbarMenuItem[] }>
    ) => {
      const menu = state.menus.find((m) => m.id === action.payload.menuId);
      if (menu) {
        menu.children = action.payload.items;
      }
    },

    // Reset state
    resetNavbar: (state) => {
      return { ...initialState };
    },

    // Initialize with server data
    initializeWithServerData: (
      state,
      action: PayloadAction<{
        navbarData?: NavbarData | null;
        menus?: NavbarMenu[];
        logo?: {
          url: string;
          altText: string;
          name: string;
        } | null;
      }>
    ) => {
      if (action.payload.navbarData) {
        state.navbarData = action.payload.navbarData;
        state.menus = action.payload.navbarData.menus || [];
        state.dataSource.navbarFromServer = true;
        state.dataSource.navbarFromClient = false;
      }
      if (action.payload.menus) {
        state.menus = action.payload.menus;
        state.dataSource.menusFromServer = true;
        state.dataSource.menusFromClient = false;
      }
      if (action.payload.logo) {
        state.logo = action.payload.logo;
        state.dataSource.logoFromServer = true;
        state.dataSource.logoFromClient = false;
      }
      state.lastFetched = Date.now();
    },
  },
});

// ===== EXPORTED ACTIONS =====
export const {
  // Data management
  setNavbarData,
  setMenus,
  setLogo,

  // Loading states
  setLoading,
  setMenuLoading,
  setLogoLoading,

  // Error states
  setError,
  setMenuError,
  setLogoError,
  clearErrors,

  // UI states
  setMenuOpen,
  setActiveMenuId,
  toggleMenu,

  // Data source tracking
  setDataSource,

  // Cache management
  setCache,
  clearCache,

  // Menu operations
  addMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,

  // Menu item operations
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,

  // Reset state
  resetNavbar,

  // Initialize with server data
  initializeWithServerData,
} = navbarSlice.actions;

// ===== SELECTORS =====
export const selectNavbarData = (state: { navbar: NavbarState }) =>
  state.navbar.navbarData;
export const selectMenus = (state: { navbar: NavbarState }) => state.navbar.menus;
export const selectLogo = (state: { navbar: NavbarState }) => state.navbar.logo;
export const selectIsLoading = (state: { navbar: NavbarState }) =>
  state.navbar.isLoading;
export const selectIsMenuLoading = (state: { navbar: NavbarState }) =>
  state.navbar.isMenuLoading;
export const selectIsLogoLoading = (state: { navbar: NavbarState }) =>
  state.navbar.isLogoLoading;
export const selectError = (state: { navbar: NavbarState }) =>
  state.navbar.error;
export const selectMenuError = (state: { navbar: NavbarState }) =>
  state.navbar.menuError;
export const selectLogoError = (state: { navbar: NavbarState }) =>
  state.navbar.logoError;
export const selectIsMenuOpen = (state: { navbar: NavbarState }) =>
  state.navbar.isMenuOpen;
export const selectActiveMenuId = (state: { navbar: NavbarState }) =>
  state.navbar.activeMenuId;
export const selectDataSource = (state: { navbar: NavbarState }) =>
  state.navbar.dataSource;
export const selectCache = (state: { navbar: NavbarState }) => state.navbar.cache;
export const selectLastFetched = (state: { navbar: NavbarState }) =>
  state.navbar.lastFetched;

// ===== REDUCER =====
export default navbarSlice.reducer;
