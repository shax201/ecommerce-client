import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReportData, ReportType, ReportFormat, ReportFilters, ReportPeriod } from "@/types/report.types";

// ===== STATE INTERFACE =====

interface ReportsState {
  // Current report being viewed
  currentReport: ReportData | null;
  
  // Report generation state
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;
  
  // Filters and search
  filters: {
    type: ReportType | 'all';
    status: string;
    dateRange: {
      start: string;
      end: string;
    };
    search: string;
  };
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  // Selected reports for bulk operations
  selectedReports: string[];
  
  // UI state
  isReportModalOpen: boolean;
  isTemplateModalOpen: boolean;
  isExportModalOpen: boolean;
  
  // Report templates
  templates: Array<{
    id: string;
    name: string;
    type: ReportType;
    format: ReportFormat;
    filters: Partial<ReportFilters>;
  }>;
  
  // Export options
  exportOptions: {
    format: ReportFormat;
    includeCharts: boolean;
    includeDetails: boolean;
  };
  
  // Report preview data
  previewData: any;
  isPreviewLoading: boolean;
  previewError: string | null;
  
  // Order management state
  orders: {
    data: any[];
    selectedOrder: any | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      search: string;
      status: string[];
      dateRange: {
        from: Date | undefined;
        to: Date | undefined;
      };
      paymentMethod: string[];
      orderValue: {
        min: number | undefined;
        max: number | undefined;
      };
      customerSegment: string[];
      sortBy: string;
      sortOrder: "asc" | "desc";
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    selectedOrders: string[];
    isBulkUpdating: boolean;
    bulkUpdateError: string | null;
  };
}

// ===== INITIAL STATE =====

const initialState: ReportsState = {
  currentReport: null,
  isGenerating: false,
  generationProgress: 0,
  generationError: null,
  filters: {
    type: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: '',
    },
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  selectedReports: [],
  isReportModalOpen: false,
  isTemplateModalOpen: false,
  isExportModalOpen: false,
  templates: [],
  exportOptions: {
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
  },
  previewData: null,
  isPreviewLoading: false,
  previewError: null,
  orders: {
    data: [],
    selectedOrder: null,
    isLoading: false,
    error: null,
    filters: {
      search: "",
      status: [],
      dateRange: {
        from: undefined,
        to: undefined,
      },
      paymentMethod: [],
      orderValue: {
        min: undefined,
        max: undefined,
      },
      customerSegment: [],
      sortBy: "created_at",
      sortOrder: "desc",
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    selectedOrders: [],
    isBulkUpdating: false,
    bulkUpdateError: null,
  },
};

// ===== SLICE =====

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    // Report selection
    setCurrentReport: (state, action: PayloadAction<ReportData | null>) => {
      state.currentReport = action.payload;
    },
    
    // Generation state
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
      if (!action.payload) {
        state.generationProgress = 0;
        state.generationError = null;
      }
    },
    setGenerationProgress: (state, action: PayloadAction<number>) => {
      state.generationProgress = action.payload;
    },
    setGenerationError: (state, action: PayloadAction<string | null>) => {
      state.generationError = action.payload;
    },
    
    // Filters
    setReportTypeFilter: (state, action: PayloadAction<ReportType | 'all'>) => {
      state.filters.type = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    setDateRangeFilter: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.filters.dateRange = action.payload;
      state.pagination.page = 1;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        status: 'all',
        dateRange: {
          start: '',
          end: '',
        },
        search: '',
      };
      state.pagination.page = 1;
    },
    
    // Pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.pagination.total = action.payload;
    },
    
    // Selection
    toggleReportSelection: (state, action: PayloadAction<string>) => {
      const reportId = action.payload;
      const index = state.selectedReports.indexOf(reportId);
      if (index > -1) {
        state.selectedReports.splice(index, 1);
      } else {
        state.selectedReports.push(reportId);
      }
    },
    selectAllReports: (state, action: PayloadAction<string[]>) => {
      state.selectedReports = action.payload;
    },
    clearSelection: (state) => {
      state.selectedReports = [];
    },
    
    // UI state
    setReportModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isReportModalOpen = action.payload;
    },
    setTemplateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTemplateModalOpen = action.payload;
    },
    setExportModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isExportModalOpen = action.payload;
    },
    
    // Templates
    setTemplates: (state, action: PayloadAction<Array<{
      id: string;
      name: string;
      type: ReportType;
      format: ReportFormat;
      filters: Partial<ReportFilters>;
    }>>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<{
      id: string;
      name: string;
      type: ReportType;
      format: ReportFormat;
      filters: Partial<ReportFilters>;
    }>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<{
      id: string;
      name: string;
      type: ReportType;
      format: ReportFormat;
      filters: Partial<ReportFilters>;
    }>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    removeTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },
    
    // Export options
    setExportFormat: (state, action: PayloadAction<ReportFormat>) => {
      state.exportOptions.format = action.payload;
    },
    setIncludeCharts: (state, action: PayloadAction<boolean>) => {
      state.exportOptions.includeCharts = action.payload;
    },
    setIncludeDetails: (state, action: PayloadAction<boolean>) => {
      state.exportOptions.includeDetails = action.payload;
    },
    
    // Preview
    setPreviewData: (state, action: PayloadAction<any>) => {
      state.previewData = action.payload;
    },
    setPreviewLoading: (state, action: PayloadAction<boolean>) => {
      state.isPreviewLoading = action.payload;
    },
    setPreviewError: (state, action: PayloadAction<string | null>) => {
      state.previewError = action.payload;
    },
    
    // Reset
    resetReportsState: () => initialState,
    
    // ===== ORDER MANAGEMENT REDUCERS =====
    
    // Order data management
    setOrdersData: (state, action: PayloadAction<any[]>) => {
      state.orders.data = action.payload;
    },
    setSelectedOrder: (state, action: PayloadAction<any | null>) => {
      state.orders.selectedOrder = action.payload;
    },
    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.orders.isLoading = action.payload;
    },
    setOrdersError: (state, action: PayloadAction<string | null>) => {
      state.orders.error = action.payload;
    },
    clearOrdersError: (state) => {
      state.orders.error = null;
    },
    
    // Order filters
    setOrderSearchFilter: (state, action: PayloadAction<string>) => {
      state.orders.filters.search = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderStatusFilter: (state, action: PayloadAction<string[]>) => {
      state.orders.filters.status = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderDateRangeFilter: (state, action: PayloadAction<{ from: Date | undefined; to: Date | undefined }>) => {
      state.orders.filters.dateRange = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderPaymentMethodFilter: (state, action: PayloadAction<string[]>) => {
      state.orders.filters.paymentMethod = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderValueFilter: (state, action: PayloadAction<{ min: number | undefined; max: number | undefined }>) => {
      state.orders.filters.orderValue = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderCustomerSegmentFilter: (state, action: PayloadAction<string[]>) => {
      state.orders.filters.customerSegment = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderSortBy: (state, action: PayloadAction<string>) => {
      state.orders.filters.sortBy = action.payload;
    },
    setOrderSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.orders.filters.sortOrder = action.payload;
    },
    clearOrderFilters: (state) => {
      state.orders.filters = {
        search: "",
        status: [],
        dateRange: {
          from: undefined,
          to: undefined,
        },
        paymentMethod: [],
        orderValue: {
          min: undefined,
          max: undefined,
        },
        customerSegment: [],
        sortBy: "created_at",
        sortOrder: "desc",
      };
      state.orders.pagination.page = 1;
    },
    
    // Order pagination
    setOrderPage: (state, action: PayloadAction<number>) => {
      state.orders.pagination.page = action.payload;
    },
    setOrderLimit: (state, action: PayloadAction<number>) => {
      state.orders.pagination.limit = action.payload;
      state.orders.pagination.page = 1;
    },
    setOrderTotal: (state, action: PayloadAction<number>) => {
      state.orders.pagination.total = action.payload;
    },
    setOrderPagination: (state, action: PayloadAction<{ page: number; limit: number; total: number }>) => {
      state.orders.pagination = action.payload;
    },
    
    // Order selection
    toggleOrderSelection: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const index = state.orders.selectedOrders.indexOf(orderId);
      if (index > -1) {
        state.orders.selectedOrders.splice(index, 1);
      } else {
        state.orders.selectedOrders.push(orderId);
      }
    },
    selectAllOrders: (state, action: PayloadAction<string[]>) => {
      state.orders.selectedOrders = action.payload;
    },
    clearOrderSelection: (state) => {
      state.orders.selectedOrders = [];
    },
    
    // Bulk operations
    setBulkUpdating: (state, action: PayloadAction<boolean>) => {
      state.orders.isBulkUpdating = action.payload;
      if (!action.payload) {
        state.orders.bulkUpdateError = null;
      }
    },
    setBulkUpdateError: (state, action: PayloadAction<string | null>) => {
      state.orders.bulkUpdateError = action.payload;
    },
    
    // Reset orders state
    resetOrdersState: (state) => {
      state.orders = {
        data: [],
        selectedOrder: null,
        isLoading: false,
        error: null,
        filters: {
          search: "",
          status: [],
          dateRange: {
            from: undefined,
            to: undefined,
          },
          paymentMethod: [],
          orderValue: {
            min: undefined,
            max: undefined,
          },
          customerSegment: [],
          sortBy: "created_at",
          sortOrder: "desc",
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
        },
        selectedOrders: [],
        isBulkUpdating: false,
        bulkUpdateError: null,
      };
    },
  },
});

// ===== EXPORTED ACTIONS =====

export const {
  // Report selection
  setCurrentReport,
  
  // Generation state
  setGenerating,
  setGenerationProgress,
  setGenerationError,
  
  // Filters
  setReportTypeFilter,
  setStatusFilter,
  setDateRangeFilter,
  setSearchFilter,
  clearFilters,
  
  // Pagination
  setPage,
  setLimit,
  setTotal,
  
  // Selection
  toggleReportSelection,
  selectAllReports,
  clearSelection,
  
  // UI state
  setReportModalOpen,
  setTemplateModalOpen,
  setExportModalOpen,
  
  // Templates
  setTemplates,
  addTemplate,
  updateTemplate,
  removeTemplate,
  
  // Export options
  setExportFormat,
  setIncludeCharts,
  setIncludeDetails,
  
  // Preview
  setPreviewData,
  setPreviewLoading,
  setPreviewError,
  
  // Reset
  resetReportsState,
  
  // Order management actions
  setOrdersData,
  setSelectedOrder,
  setOrdersLoading,
  setOrdersError,
  clearOrdersError,
  setOrderSearchFilter,
  setOrderStatusFilter,
  setOrderDateRangeFilter,
  setOrderPaymentMethodFilter,
  setOrderValueFilter,
  setOrderCustomerSegmentFilter,
  setOrderSortBy,
  setOrderSortOrder,
  clearOrderFilters,
  setOrderPage,
  setOrderLimit,
  setOrderTotal,
  setOrderPagination,
  toggleOrderSelection,
  selectAllOrders,
  clearOrderSelection,
  setBulkUpdating,
  setBulkUpdateError,
  resetOrdersState,
} = reportsSlice.actions;

// ===== SELECTORS =====

export const selectCurrentReport = (state: { reports: ReportsState }) => state.reports.currentReport;
export const selectIsGenerating = (state: { reports: ReportsState }) => state.reports.isGenerating;
export const selectGenerationProgress = (state: { reports: ReportsState }) => state.reports.generationProgress;
export const selectGenerationError = (state: { reports: ReportsState }) => state.reports.generationError;

export const selectFilters = (state: { reports: ReportsState }) => state.reports.filters;
export const selectPagination = (state: { reports: ReportsState }) => state.reports.pagination;
export const selectSelectedReports = (state: { reports: ReportsState }) => state.reports.selectedReports;

export const selectIsReportModalOpen = (state: { reports: ReportsState }) => state.reports.isReportModalOpen;export const selectIsTemplateModalOpen = (state: { reports: ReportsState }) => state.reports.isTemplateModalOpen;
export const selectIsExportModalOpen = (state: { reports: ReportsState }) => state.reports.isExportModalOpen;

export const selectTemplates = (state: { reports: ReportsState }) => state.reports.templates;
export const selectExportOptions = (state: { reports: ReportsState }) => state.reports.exportOptions;

export const selectPreviewData = (state: { reports: ReportsState }) => state.reports.previewData;
export const selectIsPreviewLoading = (state: { reports: ReportsState }) => state.reports.isPreviewLoading;
export const selectPreviewError = (state: { reports: ReportsState }) => state.reports.previewError;

// Order management selectors
export const selectOrdersData = (state: { reports: ReportsState }) => state.reports.orders.data;
export const selectSelectedOrder = (state: { reports: ReportsState }) => state.reports.orders.selectedOrder;
export const selectOrdersLoading = (state: { reports: ReportsState }) => state.reports.orders.isLoading;
export const selectOrdersError = (state: { reports: ReportsState }) => state.reports.orders.error;
export const selectOrderFilters = (state: { reports: ReportsState }) => state.reports.orders.filters;
export const selectOrderPagination = (state: { reports: ReportsState }) => state.reports.orders.pagination;
export const selectSelectedOrders = (state: { reports: ReportsState }) => state.reports.orders.selectedOrders;
export const selectIsBulkUpdating = (state: { reports: ReportsState }) => state.reports.orders.isBulkUpdating;
export const selectBulkUpdateError = (state: { reports: ReportsState }) => state.reports.orders.bulkUpdateError;

// ===== REDUCER =====

export default reportsSlice.reducer;

