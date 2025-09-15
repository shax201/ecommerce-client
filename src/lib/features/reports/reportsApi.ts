import { apiSlice } from "../api/apiSlice";
import {
  ReportData,
  ReportType,
  ReportFormat,
  ReportFilters,
  ReportPeriod,
  ReportGenerationRequest,
  ReportGenerationResponse,
  ReportListResponse,
  ReportDownloadResponse,
  ReportTemplate,
  ReportTemplateResponse,
  ExportOptions,
  ExportResponse,
  SalesReportData,
  OrdersReportData,
  ProductsReportData,
  CustomersReportData,
  InventoryReportData,
  CouponsReportData,
  AnalyticsReportData,
  FinancialReportData,
} from "@/types/report.types";

// ===== RESPONSE TYPES =====

export interface ReportDataResponse {
  success: boolean;
  message: string;
  data?: ReportData;
  error?: string;
}

export interface ReportDataListResponse {
  success: boolean;
  data: ReportData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ===== API ENDPOINTS =====

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all reports with pagination and filters
    getReports: builder.query<ReportListResponse, {
      page?: number;
      limit?: number;
      type?: ReportType;
      status?: string;
      search?: string;
    }>({
      query: ({ page = 1, limit = 10, type, status, search } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (type) params.append('type', type);
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        return {
          url: `/reports?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Report"],
    }),

    // Get single report by ID
    getReportById: builder.query<ReportDataResponse, string>({
      query: (reportId) => ({
        url: `/reports/${reportId}`,
        method: "GET",
      }),
      providesTags: (result, error, reportId) => [{ type: "Report", id: reportId }],
    }),

    // Generate new report
    generateReport: builder.mutation<ReportGenerationResponse, ReportGenerationRequest>({
      query: (reportData) => ({
        url: "/reports/generate",
        method: "POST",
        body: reportData,
      }),
      invalidatesTags: ["Report"],
    }),

    // Download report
    downloadReport: builder.mutation<ReportDownloadResponse, string>({
      query: (reportId) => ({
        url: `/reports/${reportId}/download`,
        method: "GET",
      }),
    }),

    // Delete report
    deleteReport: builder.mutation<{ success: boolean; message: string }, string>({
      query: (reportId) => ({
        url: `/reports/${reportId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
        "Report",
      ],
    }),

    // Get report templates
    getReportTemplates: builder.query<ReportTemplateResponse, void>({
      query: () => ({
        url: "/reports/templates",
        method: "GET",
      }),
      providesTags: ["ReportTemplate"],
    }),

    // Create report template
    createReportTemplate: builder.mutation<{ success: boolean; data: ReportTemplate }, Partial<ReportTemplate>>({
      query: (templateData) => ({
        url: "/reports/templates",
        method: "POST",
        body: templateData,
      }),
      invalidatesTags: ["ReportTemplate"],
    }),

    // Update report template
    updateReportTemplate: builder.mutation<{ success: boolean; data: ReportTemplate }, { id: string; data: Partial<ReportTemplate> }>({
      query: ({ id, data }) => ({
        url: `/reports/templates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ReportTemplate", id },
        "ReportTemplate",
      ],
    }),

    // Delete report template
    deleteReportTemplate: builder.mutation<{ success: boolean; message: string }, string>({
      query: (templateId) => ({
        url: `/reports/templates/${templateId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, templateId) => [
        { type: "ReportTemplate", id: templateId },
        "ReportTemplate",
      ],
    }),

    // Export data
    exportData: builder.mutation<ExportResponse, ExportOptions>({
      query: (exportOptions) => ({
        url: "/reports/export",
        method: "POST",
        body: exportOptions,
      }),
    }),

    // ===== SPECIFIC REPORT DATA ENDPOINTS =====

    // Get sales report data
    getSalesReportData: builder.query<{ success: boolean; data: SalesReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/sales",
        method: "POST",
        body: filters,
      }),
      providesTags: ["SalesReport"],
    }),

    // Get orders report data
    getOrdersReportData: builder.query<{ success: boolean; data: OrdersReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/orders",
        method: "POST",
        body: filters,
      }),
      providesTags: ["OrdersReport"],
    }),

    // Get products report data
    getProductsReportData: builder.query<{ success: boolean; data: ProductsReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/products",
        method: "POST",
        body: filters,
      }),
      providesTags: ["ProductsReport"],
    }),

    // Get customers report data
    getCustomersReportData: builder.query<{ success: boolean; data: CustomersReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/customers",
        method: "POST",
        body: filters,
      }),
      providesTags: ["CustomersReport"],
    }),

    // Get inventory report data
    getInventoryReportData: builder.query<{ success: boolean; data: InventoryReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/inventory",
        method: "POST",
        body: filters,
      }),
      providesTags: ["InventoryReport"],
    }),

    // Get coupons report data
    getCouponsReportData: builder.query<{ success: boolean; data: CouponsReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/coupons",
        method: "POST",
        body: filters,
      }),
      providesTags: ["CouponsReport"],
    }),

    // Get analytics report data
    getAnalyticsReportData: builder.query<{ success: boolean; data: AnalyticsReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/analytics",
        method: "POST",
        body: filters,
      }),
      providesTags: ["AnalyticsReport"],
    }),

    // Get financial report data
    getFinancialReportData: builder.query<{ success: boolean; data: FinancialReportData }, ReportFilters>({
      query: (filters) => ({
        url: "/reports/data/financial",
        method: "POST",
        body: filters,
      }),
      providesTags: ["FinancialReport"],
    }),

    // ===== REPORT STATUS ENDPOINTS =====

    // Check report generation status
    checkReportStatus: builder.query<{ success: boolean; data: { status: string; progress?: number } }, string>({
      query: (reportId) => ({
        url: `/reports/${reportId}/status`,
        method: "GET",
      }),
      providesTags: (result, error, reportId) => [{ type: "Report", id: reportId }],
    }),

    // Cancel report generation
    cancelReportGeneration: builder.mutation<{ success: boolean; message: string }, string>({
      query: (reportId) => ({
        url: `/reports/${reportId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (result, error, reportId) => [
        { type: "Report", id: reportId },
        "Report",
      ],
    }),

    // ===== BULK OPERATIONS =====

    // Bulk delete reports
    bulkDeleteReports: builder.mutation<{ success: boolean; message: string }, string[]>({
      query: (reportIds) => ({
        url: "/reports/bulk-delete",
        method: "POST",
        body: { reportIds },
      }),
      invalidatesTags: ["Report"],
    }),

    // Bulk generate reports
    bulkGenerateReports: builder.mutation<{ success: boolean; data: { reportIds: string[] } }, ReportGenerationRequest[]>({
      query: (reportsData) => ({
        url: "/reports/bulk-generate",
        method: "POST",
        body: { reports: reportsData },
      }),
      invalidatesTags: ["Report"],
    }),

    // ===== ORDER MANAGEMENT ENDPOINTS =====

    // Get orders with filters for reports
    getOrdersForReports: builder.query<{
      success: boolean;
      data: any[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }, {
      search?: string;
      status?: string[];
      dateRange?: {
        from: Date | undefined;
        to: Date | undefined;
      };
      page?: number;
      limit?: number;
    }>({
      query: ({ search, status, dateRange, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (status && status.length > 0) {
          status.forEach(s => params.append('status', s));
        }
        if (dateRange?.from) {
          params.append('dateFrom', dateRange.from.toISOString().split('T')[0]);
        }
        if (dateRange?.to) {
          params.append('dateTo', dateRange.to.toISOString().split('T')[0]);
        }
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return {
          url: `/orders?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Order"],
    }),

    // Update order status for reports
    updateOrderStatusForReports: builder.mutation<{
      success: boolean;
      message: string;
      data?: any;
    }, {
      orderId: string;
      status: string;
    }>({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
        "OrdersReport",
      ],
    }),

    // Get order details for reports
    getOrderDetailsForReports: builder.query<{
      success: boolean;
      data: any;
    }, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),

    // Bulk update order statuses
    bulkUpdateOrderStatuses: builder.mutation<{
      success: boolean;
      message: string;
      data: { updated: number; failed: number };
    }, {
      orderIds: string[];
      status: string;
    }>({
      query: ({ orderIds, status }) => ({
        url: "/orders/bulk-status-update",
        method: "POST",
        body: { orderIds, status },
      }),
      invalidatesTags: ["Order", "OrdersReport"],
    }),

    // Get order analytics for reports
    getOrderAnalyticsForReports: builder.query<{
      success: boolean;
      data: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        ordersByStatus: {
          pending: number;
          processing: number;
          shipped: number;
          delivered: number;
          cancelled: number;
        };
        ordersByMonth: Array<{
          month: string;
          orders: number;
          revenue: number;
        }>;
        topProducts: Array<{
          productId: string;
          productName: string;
          quantitySold: number;
          revenue: number;
        }>;
      };
    }, {
      dateRange?: {
        start: string;
        end: string;
      };
    }>({
      query: ({ dateRange } = {}) => {
        const params = new URLSearchParams();
        if (dateRange?.start) params.append('startDate', dateRange.start);
        if (dateRange?.end) params.append('endDate', dateRange.end);
        
        return {
          url: `/orders/analytics?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["OrderAnalytics"],
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  // Main report operations
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGenerateReportMutation,
  useDownloadReportMutation,
  useDeleteReportMutation,

  // Template operations
  useGetReportTemplatesQuery,
  useCreateReportTemplateMutation,
  useUpdateReportTemplateMutation,
  useDeleteReportTemplateMutation,

  // Export operations
  useExportDataMutation,

  // Specific report data
  useGetSalesReportDataQuery,
  useGetOrdersReportDataQuery,
  useGetProductsReportDataQuery,
  useGetCustomersReportDataQuery,
  useGetInventoryReportDataQuery,
  useGetCouponsReportDataQuery,
  useGetAnalyticsReportDataQuery,
  useGetFinancialReportDataQuery,

  // Status operations
  useCheckReportStatusQuery,
  useCancelReportGenerationMutation,

  // Bulk operations
  useBulkDeleteReportsMutation,
  useBulkGenerateReportsMutation,

  // Order management for reports
  useGetOrdersForReportsQuery,
  useUpdateOrderStatusForReportsMutation,
  useGetOrderDetailsForReportsQuery,
  useBulkUpdateOrderStatusesMutation,
  useGetOrderAnalyticsForReportsQuery,
} = reportsApi;
