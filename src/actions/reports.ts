"use server";

import { revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";
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

const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
};

// ===== ISR-ENABLED FUNCTIONS =====

// Cached function for fetching reports list
export const getReportsISR = unstable_cache(
  async (options: {
    page?: number;
    limit?: number;
    type?: ReportType;
    status?: string;
    search?: string;
  } = {}): Promise<ReportListResponse> => {
    try {
      const params = new URLSearchParams({
        page: (options.page || 1).toString(),
        limit: (options.limit || 10).toString(),
      });

      if (options.type) params.append('type', options.type);
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);

      const response = await fetch(`${getBackendUrl()}/reports?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data || [],
          pagination: data.pagination,
        };
      } else {
        return {
          success: false,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        };
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    }
  },
  ["reports"],
  {
    tags: [ISR_TAGS.ORDERS], // Using orders tag for now, can be updated
    revalidate: 60, // 1 minute
  }
);

// Cached function for fetching report templates
export const getReportTemplatesISR = unstable_cache(
  async (): Promise<ReportTemplateResponse> => {
    try {
      const response = await fetch(`${getBackendUrl()}/reports/templates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data || [],
        };
      } else {
        return {
          success: false,
          data: [],
        };
      }
    } catch (error) {
      console.error("Error fetching report templates:", error);
      return {
        success: false,
        data: [],
      };
    }
  },
  ["report-templates"],
  {
    tags: [ISR_TAGS.ORDERS],
    revalidate: 300, // 5 minutes
  }
);

// Cached function for fetching sales report data
export const getSalesReportDataISR = unstable_cache(
  async (filters: ReportFilters): Promise<{ success: boolean; data: SalesReportData }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/reports/data/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
        next: { revalidate: 60 },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          data: {
            summary: {
              totalSales: 0,
              totalOrders: 0,
              averageOrderValue: 0,
              totalRevenue: 0,
              totalTax: 0,
              totalDiscount: 0,
              netRevenue: 0,
            },
            dailySales: [],
            monthlySales: [],
            topProducts: [],
            salesByCategory: [],
            salesByPaymentMethod: [],
          },
        };
      }
    } catch (error) {
      console.error("Error fetching sales report data:", error);
      return {
        success: false,
        data: {
          summary: {
            totalSales: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            totalRevenue: 0,
            totalTax: 0,
            totalDiscount: 0,
            netRevenue: 0,
          },
          dailySales: [],
          monthlySales: [],
          topProducts: [],
          salesByCategory: [],
          salesByPaymentMethod: [],
        },
      };
    }
  },
  ["sales-report-data"],
  {
    tags: [ISR_TAGS.ORDERS],
    revalidate: 60, // 1 minute
  }
);

// Cached function for fetching orders report data
export const getOrdersReportDataISR = unstable_cache(
  async (filters: ReportFilters): Promise<{ success: boolean; data: OrdersReportData }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/reports/data/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
        next: { revalidate: 60 },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          data: {
            summary: {
              totalOrders: 0,
              pendingOrders: 0,
              completedOrders: 0,
              cancelledOrders: 0,
              totalValue: 0,
              averageOrderValue: 0,
            },
            ordersByStatus: [],
            ordersByMonth: [],
            topCustomers: [],
            orderTimeline: [],
          },
        };
      }
    } catch (error) {
      console.error("Error fetching orders report data:", error);
      return {
        success: false,
        data: {
          summary: {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalValue: 0,
            averageOrderValue: 0,
          },
          ordersByStatus: [],
          ordersByMonth: [],
          topCustomers: [],
          orderTimeline: [],
        },
      };
    }
  },
  ["orders-report-data"],
  {
    tags: [ISR_TAGS.ORDERS],
    revalidate: 60, // 1 minute
  }
);

// ===== SERVER ACTIONS FOR REPORT GENERATION =====

// Generate report with cache invalidation
export async function generateReportWithCacheInvalidation(
  reportData: ReportGenerationRequest
): Promise<ReportGenerationResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful generation
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        message: "Report generation started successfully",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to generate report",
        error: data.error,
      };
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return {
      success: false,
      message: "An error occurred while generating the report",
      error: "Network error",
    };
  }
}

// Download report
export async function downloadReportWithCacheInvalidation(
  reportId: string
): Promise<ReportDownloadResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/${reportId}/download`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to download report",
      };
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    return {
      success: false,
      error: "Network error occurred while downloading report",
    };
  }
}

// Delete report with cache invalidation
export async function deleteReportWithCacheInvalidation(
  reportId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/${reportId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful deletion
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        message: "Report deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to delete report",
      };
    }
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      message: "An error occurred while deleting the report",
    };
  }
}

// Create report template with cache invalidation
export async function createReportTemplateWithCacheInvalidation(
  templateData: Partial<ReportTemplate>
): Promise<{ success: boolean; data?: ReportTemplate; message: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful creation
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        data: data.data,
        message: "Report template created successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create report template",
      };
    }
  } catch (error) {
    console.error("Error creating report template:", error);
    return {
      success: false,
      message: "An error occurred while creating the report template",
    };
  }
}

// Update report template with cache invalidation
export async function updateReportTemplateWithCacheInvalidation(
  templateId: string,
  templateData: Partial<ReportTemplate>
): Promise<{ success: boolean; data?: ReportTemplate; message: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/templates/${templateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful update
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        data: data.data,
        message: "Report template updated successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update report template",
      };
    }
  } catch (error) {
    console.error("Error updating report template:", error);
    return {
      success: false,
      message: "An error occurred while updating the report template",
    };
  }
}

// Delete report template with cache invalidation
export async function deleteReportTemplateWithCacheInvalidation(
  templateId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/templates/${templateId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful deletion
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        message: "Report template deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to delete report template",
      };
    }
  } catch (error) {
    console.error("Error deleting report template:", error);
    return {
      success: false,
      message: "An error occurred while deleting the report template",
    };
  }
}

// Export data with cache invalidation
export async function exportDataWithCacheInvalidation(
  exportOptions: ExportOptions
): Promise<ExportResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exportOptions),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to export data",
      };
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    return {
      success: false,
      error: "Network error occurred while exporting data",
    };
  }
}

// Bulk delete reports with cache invalidation
export async function bulkDeleteReportsWithCacheInvalidation(
  reportIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${getBackendUrl()}/reports/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reportIds }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful bulk deletion
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        message: `Successfully deleted ${reportIds.length} report(s)`,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to delete reports",
      };
    }
  } catch (error) {
    console.error("Error bulk deleting reports:", error);
    return {
      success: false,
      message: "An error occurred while deleting reports",
    };
  }
}

// ===== ORDER STATUS MANAGEMENT =====

// Update order status
export async function updateOrderStatusWithCacheInvalidation(
  orderId: string,
  status: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch(`${getBackendUrl()}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful status update
      revalidateTag(ISR_TAGS.ORDERS);
      
      return {
        success: true,
        message: "Order status updated successfully",
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update order status",
      };
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: "An error occurred while updating order status",
    };
  }
}

// Get orders with filters
export async function getOrdersWithFilters(
  filters: {
    search?: string;
    status?: string[];
    dateRange?: {
      from: Date | undefined;
      to: Date | undefined;
    };
    page?: number;
    limit?: number;
  }
): Promise<{ success: boolean; data: any[]; pagination?: any }> {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.dateRange?.from) {
      params.append('dateFrom', filters.dateRange.from.toISOString().split('T')[0]);
    }
    if (filters.dateRange?.to) {
      params.append('dateTo', filters.dateRange.to.toISOString().split('T')[0]);
    }
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${getBackendUrl()}/orders?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination,
      };
    } else {
      return {
        success: false,
        data: [],
      };
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      data: [],
    };
  }
}

// ===== UTILITY FUNCTIONS =====

// Get predefined report periods
export async function getReportPeriods(): Promise<ReportPeriod[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      label: "Today",
      value: "today",
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    {
      label: "Yesterday",
      value: "yesterday",
      startDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      label: "Last 7 days",
      value: "last7days",
      startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    {
      label: "Last 30 days",
      value: "last30days",
      startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    {
      label: "This month",
      value: "thismonth",
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    {
      label: "Last month",
      value: "lastmonth",
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
      endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
    },
    {
      label: "This year",
      value: "thisyear",
      startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    {
      label: "Last year",
      value: "lastyear",
      startDate: new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
      endDate: new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0],
    },
  ];
}

// Get report type options
export async function getReportTypeOptions(): Promise<Array<{ value: ReportType; label: string; description: string }>> {
  return [
    {
      value: "sales",
      label: "Sales Report",
      description: "Revenue, orders, and sales performance metrics",
    },
    {
      value: "orders",
      label: "Orders Report",
      description: "Order status, fulfillment, and customer insights",
    },
    {
      value: "products",
      label: "Products Report",
      description: "Product performance, inventory, and sales data",
    },
    {
      value: "customers",
      label: "Customers Report",
      description: "Customer behavior, segments, and lifetime value",
    },
    {
      value: "inventory",
      label: "Inventory Report",
      description: "Stock levels, movements, and low stock alerts",
    },
    {
      value: "coupons",
      label: "Coupons Report",
      description: "Coupon usage, performance, and discount analytics",
    },
    {
      value: "analytics",
      label: "Analytics Report",
      description: "Website traffic, conversion rates, and user behavior",
    },
    {
      value: "financial",
      label: "Financial Report",
      description: "Revenue, costs, profit margins, and financial metrics",
    },
  ];
}

// Get report format options
export async function getReportFormatOptions(): Promise<Array<{ value: ReportFormat; label: string; description: string }>> {
  return [
    {
      value: "pdf",
      label: "PDF",
      description: "Portable Document Format - best for sharing and printing",
    },
    {
      value: "excel",
      label: "Excel",
      description: "Microsoft Excel format - best for data analysis",
    },
    {
      value: "csv",
      label: "CSV",
      description: "Comma Separated Values - best for data import",
    },
    {
      value: "json",
      label: "JSON",
      description: "JavaScript Object Notation - best for API integration",
    },
  ];
}
