import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CourierCredentials,
  CourierOrder,
  CourierType,
  CourierFilters,
  CourierPagination,
  CourierCredentialsFormData,
  CourierOrderFormData,
} from "@/types/courier.types";

// ===== STATE INTERFACE =====

interface CourierState {
  // Credentials Management
  credentials: {
    list: CourierCredentials[];
    activeCouriers: CourierType[];
    selectedCourier: CourierType | null;
    isCredentialsLoading: boolean;
    credentialsError: string | null;
  };

  // Orders Management
  orders: {
    list: CourierOrder[];
    selectedOrder: CourierOrder | null;
    isOrdersLoading: boolean;
    ordersError: string | null;
  };

  // Pagination
  pagination: CourierPagination;

  // Filters
  filters: CourierFilters;

  // UI State
  ui: {
    // Credentials UI
    isCredentialsFormOpen: boolean;
    isCredentialsEditMode: boolean;
    editingCredentialsId: string | null;
    
    // Orders UI
    isOrderFormOpen: boolean;
    isOrderEditMode: boolean;
    editingOrderId: string | null;
    
    // Bulk Operations
    selectedCredentials: string[];
    selectedOrders: string[];
    isBulkOperationLoading: boolean;
    
    // Modals
    isDeleteModalOpen: boolean;
    isStatusUpdateModalOpen: boolean;
    isPriceCalculationModalOpen: boolean;
    
    // Active Tab
    activeTab: 'credentials' | 'orders' | 'operations';
  };

  // Form State
  forms: {
    credentialsForm: CourierCredentialsFormData | null;
    orderForm: CourierOrderFormData | null;
  };

  // Validation State
  validation: {
    credentialsValidation: {
      isValid: boolean;
      error?: string;
    } | null;
    orderValidation: {
      isValid: boolean;
      error?: string;
    } | null;
  };
}

// ===== INITIAL STATE =====

const initialState: CourierState = {
  // Credentials Management
  credentials: {
    list: [],
    activeCouriers: [],
    selectedCourier: null,
    isCredentialsLoading: false,
    credentialsError: null,
  },

  // Orders Management
  orders: {
    list: [],
    selectedOrder: null,
    isOrdersLoading: false,
    ordersError: null,
  },

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filters
  filters: {
    search: '',
    courier: undefined,
    status: undefined,
    isActive: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  },

  // UI State
  ui: {
    // Credentials UI
    isCredentialsFormOpen: false,
    isCredentialsEditMode: false,
    editingCredentialsId: null,
    
    // Orders UI
    isOrderFormOpen: false,
    isOrderEditMode: false,
    editingOrderId: null,
    
    // Bulk Operations
    selectedCredentials: [],
    selectedOrders: [],
    isBulkOperationLoading: false,
    
    // Modals
    isDeleteModalOpen: false,
    isStatusUpdateModalOpen: false,
    isPriceCalculationModalOpen: false,
    
    // Active Tab
    activeTab: 'credentials',
  },

  // Form State
  forms: {
    credentialsForm: null,
    orderForm: null,
  },

  // Validation State
  validation: {
    credentialsValidation: null,
    orderValidation: null,
  },
};

// ===== SLICE =====

const courierSlice = createSlice({
  name: 'courier',
  initialState,
  reducers: {
    // ===== CREDENTIALS ACTIONS =====
    
    setCredentialsList: (state, action: PayloadAction<CourierCredentials[]>) => {
      state.credentials.list = action.payload;
    },

    setActiveCouriers: (state, action: PayloadAction<CourierType[]>) => {
      state.credentials.activeCouriers = action.payload;
    },

    setSelectedCourier: (state, action: PayloadAction<CourierType | null>) => {
      state.credentials.selectedCourier = action.payload;
    },

    setCredentialsLoading: (state, action: PayloadAction<boolean>) => {
      state.credentials.isCredentialsLoading = action.payload;
    },

    setCredentialsError: (state, action: PayloadAction<string | null>) => {
      state.credentials.credentialsError = action.payload;
    },

    addCredentials: (state, action: PayloadAction<CourierCredentials>) => {
      state.credentials.list.push(action.payload);
    },

    updateCredentials: (state, action: PayloadAction<CourierCredentials>) => {
      const index = state.credentials.list.findIndex(
        cred => cred._id === action.payload._id
      );
      if (index !== -1) {
        state.credentials.list[index] = action.payload;
      }
    },

    removeCredentials: (state, action: PayloadAction<string>) => {
      state.credentials.list = state.credentials.list.filter(
        cred => cred._id !== action.payload
      );
    },

    // ===== ORDERS ACTIONS =====
    
    setOrdersList: (state, action: PayloadAction<CourierOrder[]>) => {
      state.orders.list = action.payload;
    },

    setSelectedOrder: (state, action: PayloadAction<CourierOrder | null>) => {
      state.orders.selectedOrder = action.payload;
    },

    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.orders.isOrdersLoading = action.payload;
    },

    setOrdersError: (state, action: PayloadAction<string | null>) => {
      state.orders.ordersError = action.payload;
    },

    addOrder: (state, action: PayloadAction<CourierOrder>) => {
      state.orders.list.push(action.payload);
    },

    updateOrder: (state, action: PayloadAction<CourierOrder>) => {
      const index = state.orders.list.findIndex(
        order => order.id === action.payload.id
      );
      if (index !== -1) {
        state.orders.list[index] = action.payload;
      }
    },

    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders.list = state.orders.list.filter(
        order => order.id !== action.payload
      );
    },

    // ===== PAGINATION ACTIONS =====
    
    setPagination: (state, action: PayloadAction<CourierPagination>) => {
      state.pagination = action.payload;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },

    // ===== FILTERS ACTIONS =====
    
    setFilters: (state, action: PayloadAction<CourierFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },

    setCourierFilter: (state, action: PayloadAction<CourierType | undefined>) => {
      state.filters.courier = action.payload;
    },

    setStatusFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.status = action.payload;
    },

    setActiveFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.isActive = action.payload;
    },

    setDateRangeFilter: (state, action: PayloadAction<{ from?: string; to?: string }>) => {
      state.filters.dateFrom = action.payload.from;
      state.filters.dateTo = action.payload.to;
    },

    clearFilters: (state) => {
      state.filters = {
        search: '',
        courier: undefined,
        status: undefined,
        isActive: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      };
    },

    // ===== UI ACTIONS =====
    
    // Credentials UI
    setCredentialsFormOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isCredentialsFormOpen = action.payload;
    },

    setCredentialsEditMode: (state, action: PayloadAction<boolean>) => {
      state.ui.isCredentialsEditMode = action.payload;
    },

    setEditingCredentialsId: (state, action: PayloadAction<string | null>) => {
      state.ui.editingCredentialsId = action.payload;
    },

    // Orders UI
    setOrderFormOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isOrderFormOpen = action.payload;
    },

    setOrderEditMode: (state, action: PayloadAction<boolean>) => {
      state.ui.isOrderEditMode = action.payload;
    },

    setEditingOrderId: (state, action: PayloadAction<string | null>) => {
      state.ui.editingOrderId = action.payload;
    },

    // Bulk Operations
    setSelectedCredentials: (state, action: PayloadAction<string[]>) => {
      state.ui.selectedCredentials = action.payload;
    },

    setSelectedOrders: (state, action: PayloadAction<string[]>) => {
      state.ui.selectedOrders = action.payload;
    },

    setBulkOperationLoading: (state, action: PayloadAction<boolean>) => {
      state.ui.isBulkOperationLoading = action.payload;
    },

    // Modals
    setDeleteModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isDeleteModalOpen = action.payload;
    },

    setStatusUpdateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isStatusUpdateModalOpen = action.payload;
    },

    setPriceCalculationModalOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isPriceCalculationModalOpen = action.payload;
    },

    // Active Tab
    setActiveTab: (state, action: PayloadAction<'credentials' | 'orders' | 'operations'>) => {
      state.ui.activeTab = action.payload;
    },

    // ===== FORM ACTIONS =====
    
    setCredentialsForm: (state, action: PayloadAction<CourierCredentialsFormData | null>) => {
      state.forms.credentialsForm = action.payload;
    },

    setOrderForm: (state, action: PayloadAction<CourierOrderFormData | null>) => {
      state.forms.orderForm = action.payload;
    },

    clearCredentialsForm: (state) => {
      state.forms.credentialsForm = null;
    },

    clearOrderForm: (state) => {
      state.forms.orderForm = null;
    },

    // ===== VALIDATION ACTIONS =====
    
    setCredentialsValidation: (state, action: PayloadAction<{
      isValid: boolean;
      error?: string;
    } | null>) => {
      state.validation.credentialsValidation = action.payload;
    },

    setOrderValidation: (state, action: PayloadAction<{
      isValid: boolean;
      error?: string;
    } | null>) => {
      state.validation.orderValidation = action.payload;
    },

    // ===== RESET ACTIONS =====
    
    resetCredentialsState: (state) => {
      state.credentials = initialState.credentials;
    },

    resetOrdersState: (state) => {
      state.orders = initialState.orders;
    },

    resetUIState: (state) => {
      state.ui = initialState.ui;
    },

    resetFormState: (state) => {
      state.forms = initialState.forms;
    },

    resetValidationState: (state) => {
      state.validation = initialState.validation;
    },

    resetAllState: () => initialState,
  },
});

// ===== EXPORTS =====

export const {
  // Credentials
  setCredentialsList,
  setActiveCouriers,
  setSelectedCourier,
  setCredentialsLoading,
  setCredentialsError,
  addCredentials,
  updateCredentials,
  removeCredentials,

  // Orders
  setOrdersList,
  setSelectedOrder,
  setOrdersLoading,
  setOrdersError,
  addOrder,
  updateOrder,
  removeOrder,

  // Pagination
  setPagination,
  setCurrentPage,
  setPageSize,

  // Filters
  setFilters,
  setSearchQuery,
  setCourierFilter,
  setStatusFilter,
  setActiveFilter,
  setDateRangeFilter,
  clearFilters,

  // UI
  setCredentialsFormOpen,
  setCredentialsEditMode,
  setEditingCredentialsId,
  setOrderFormOpen,
  setOrderEditMode,
  setEditingOrderId,
  setSelectedCredentials,
  setSelectedOrders,
  setBulkOperationLoading,
  setDeleteModalOpen,
  setStatusUpdateModalOpen,
  setPriceCalculationModalOpen,
  setActiveTab,

  // Forms
  setCredentialsForm,
  setOrderForm,
  clearCredentialsForm,
  clearOrderForm,

  // Validation
  setCredentialsValidation,
  setOrderValidation,

  // Reset
  resetCredentialsState,
  resetOrdersState,
  resetUIState,
  resetFormState,
  resetValidationState,
  resetAllState,
} = courierSlice.actions;

export default courierSlice.reducer;
