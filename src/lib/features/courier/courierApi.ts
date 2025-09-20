import { apiSlice } from "../api/apiSlice";
import {
  CourierCredentials,
  CourierCredentialsResponse,
  CourierCredentialsListResponse,
  CreateCourierCredentialsRequest,
  UpdateCourierCredentialsRequest,
  CourierOperationsResponse,
  CourierOrderData,
  CourierOrder,
  CourierOrderResponse,
  CourierOrderListResponse,
  CourierPriceCalculationRequest,
  CourierPriceResponse,
  CourierStatusResponse,
  CourierType,
  CourierFilters,
  CourierPagination
} from "@/types/courier.types";

// ===== COURIER CREDENTIALS API =====

export const courierCredentialsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all courier credentials
    getCourierCredentials: builder.query<{ success: boolean; data: CourierCredentials[] }, void>({
      query: () => ({
        url: '/courier/credentials',
        method: 'GET',
      }),
      providesTags: ['CourierCredentials'],
    }),

    // Get active couriers
    getActiveCouriers: builder.query<{ success: boolean; data: string[] }, void>({
      query: () => ({
        url: '/courier/credentials/active',
        method: 'GET',
      }),
      providesTags: ['CourierCredentials'],
    }),

    // Get credentials by courier
    getCourierCredentialsByType: builder.query<{ success: boolean; data: CourierCredentials }, CourierType>({
      query: (courier) => ({
        url: `/courier/credentials/${courier}`,
        method: 'GET',
      }),
      providesTags: (result, error, courier) => [
        { type: 'CourierCredentials', id: courier },
      ],
    }),

    // Create courier credentials
    createCourierCredentials: builder.mutation<{ success: boolean; data: CourierCredentials; message: string }, CreateCourierCredentialsRequest>({
      query: (data) => ({
        url: '/courier/credentials',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CourierCredentials'],
    }),

    // Update courier credentials
    updateCourierCredentials: builder.mutation<{ success: boolean; data: CourierCredentials; message: string }, {
      courier: CourierType;
      data: UpdateCourierCredentialsRequest;
    }>({
      query: ({ courier, data }) => ({
        url: `/courier/credentials/${courier}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { courier }) => [
        { type: 'CourierCredentials', id: courier },
        'CourierCredentials',
      ],
    }),

    // Toggle courier credentials status
    toggleCourierCredentialsStatus: builder.mutation<{ success: boolean; data: CourierCredentials; message: string }, { courier: CourierType; action: 'activate' | 'deactivate' }>({
      query: ({ courier, action }) => ({
        url: `/courier/credentials/${courier}/status`,
        method: 'PATCH',
        body: { action },
      }),
      invalidatesTags: (result, error, { courier }) => [
        { type: 'CourierCredentials', id: courier },
        'CourierCredentials',
      ],
    }),

    // Delete courier credentials
    deleteCourierCredentials: builder.mutation<{ success: boolean; message: string }, CourierType>({
      query: (courier) => ({
        url: `/courier/credentials/${courier}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CourierCredentials'],
    }),
  }),
});

// ===== COURIER OPERATIONS API =====

export const courierOperationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get available couriers
    getAvailableCouriers: builder.query<{ success: boolean; data: string[] }, void>({
      query: () => ({
        url: '/courier/operations/available',
        method: 'GET',
      }),
      providesTags: ['CourierOperations'],
    }),

    // Validate courier credentials
    validateCourier: builder.query<{ success: boolean; data: { courier: string; isValid: boolean; message: string } }, CourierType>({
      query: (courier) => ({
        url: `/courier/operations/validate/${courier}`,
        method: 'GET',
      }),
      providesTags: (result, error, courier) => [
        { type: 'CourierOperations', id: courier },
      ],
    }),

    // Create order
    createCourierOrder: builder.mutation<{ success: boolean; data: any; consignmentId?: string; trackingNumber?: string; deliveryFee?: number; message: string }, {
      courier: CourierType;
      orderData: CourierOrderData;
    }>({
      query: ({ courier, orderData }) => ({
        url: `/courier/operations/${courier}/order`,
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['CourierOperations', 'CourierOrders'],
    }),

    // Create bulk orders
    createBulkCourierOrders: builder.mutation<{ success: boolean; data: any; message: string }, {
      courier: CourierType;
      orders: CourierOrderData[];
    }>({
      query: ({ courier, orders }) => ({
        url: `/courier/operations/${courier}/bulk-order`,
        method: 'POST',
        body: { orders },
      }),
      invalidatesTags: ['CourierOperations', 'CourierOrders'],
    }),

    // Get order status
    getCourierOrderStatus: builder.query<{ success: boolean; data: { status: string; trackingSteps: any[] } }, {
      courier: CourierType;
      consignmentId: string;
    }>({
      query: ({ courier, consignmentId }) => ({
        url: `/courier/operations/${courier}/status/${consignmentId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { courier, consignmentId }) => [
        { type: 'CourierOperations', id: `${courier}-${consignmentId}` },
      ],
    }),

    // Calculate price
    calculateCourierPrice: builder.mutation<{ success: boolean; data: { deliveryFee: number; estimatedDeliveryTime: string } }, { courier: CourierType; params: any }>({
      query: ({ courier, params }) => ({
        url: `/courier/operations/${courier}/calculate-price`,
        method: 'POST',
        body: params,
      }),
    }),
  }),
});

// ===== COURIER ORDERS API =====

export const courierOrdersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create order with courier
    createOrderWithCourier: builder.mutation<{ success: boolean; data: any; message: string }, {
      orderId: string;
      courier: CourierType;
    }>({
      query: ({ orderId, courier }) => ({
        url: `/courier/orders/${orderId}/create`,
        method: 'POST',
        body: { courier },
      }),
      invalidatesTags: ['CourierOrders'],
    }),

    // Update order status
    updateCourierOrderStatus: builder.mutation<{ success: boolean; data: any }, string>({
      query: (orderId) => ({
        url: `/courier/orders/${orderId}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'CourierOrders', id: orderId },
        'CourierOrders',
      ],
    }),

    // Get order tracking
    getCourierOrderTracking: builder.query<{ success: boolean; data: any }, string>({
      query: (orderId) => ({
        url: `/courier/orders/${orderId}/tracking`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [
        { type: 'CourierOrders', id: orderId },
      ],
    }),

    // Calculate delivery price for order
    calculateOrderDeliveryPrice: builder.mutation<{ success: boolean; data: { deliveryFee: number; estimatedDeliveryTime: string } }, {
      orderId: string;
      courier: CourierType;
    }>({
      query: ({ orderId, courier }) => ({
        url: `/courier/orders/${orderId}/calculate-price`,
        method: 'POST',
        body: { courier },
      }),
    }),

    // Get available couriers for order
    getAvailableCouriersForOrder: builder.query<{ success: boolean; data: string[] }, string>({
      query: (orderId) => ({
        url: `/courier/orders/${orderId}/available-couriers`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [
        { type: 'CourierOrders', id: orderId },
      ],
    }),

    // Get all courier orders with pagination and filters
    getCourierOrders: builder.query<CourierOrderListResponse, {
      page?: number;
      limit?: number;
      filters?: CourierFilters;
    }>({
      query: ({ page = 1, limit = 10, filters = {} } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (filters.search) params.append('search', filters.search);
        if (filters.courier) params.append('courier', filters.courier);
        if (filters.status) params.append('status', filters.status);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return {
          url: `/courier/orders?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['CourierOrders'],
    }),

    // Delete courier order
    deleteCourierOrder: builder.mutation<{ success: boolean; message: string }, string>({
      query: (orderId) => ({
        url: `/courier/orders/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'CourierOrders', id: orderId },
        'CourierOrders',
      ],
    }),

    // Bulk delete courier orders
    bulkDeleteCourierOrders: builder.mutation<{ success: boolean; message: string }, string[]>({
      query: (orderIds) => ({
        url: '/courier/orders/bulk-delete',
        method: 'DELETE',
        body: { orderIds },
      }),
      invalidatesTags: ['CourierOrders'],
    }),
  }),
});

// ===== COURIER STATS API =====

export const courierStatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get comprehensive courier statistics
    getCourierStats: builder.query<{
      success: boolean;
      data: {
        activeCouriers: {
          count: number;
          list: string[];
          description: string;
        };
        totalOrders: {
          count: number;
          growth: number;
          description: string;
        };
        pendingOrders: {
          count: number;
          growth: number;
          description: string;
        };
        successRate: {
          percentage: number;
          growth: number;
          description: string;
        };
        additionalMetrics: {
          deliveredOrders: number;
          cancelledOrders: number;
          averageOrderValue: number;
          totalRevenue: number;
        };
      };
    }, void>({
      query: () => ({
        url: '/courier/stats',
        method: 'GET',
      }),
      providesTags: ['CourierStats'],
    }),

    // Get courier performance metrics
    getCourierPerformance: builder.query<{
      success: boolean;
      data: {
        courier: string;
        isValid: boolean;
        performance: {
          totalOrders: number;
          successRate: number;
          averageDeliveryTime: number;
          lastOrderDate: string;
          isOnline: boolean;
        };
      };
    }, string>({
      query: (courier) => ({
        url: `/courier/performance/${courier}`,
        method: 'GET',
      }),
      providesTags: (result, error, courier) => [
        { type: 'CourierStats', id: courier },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCourierCredentialsQuery,
  useGetActiveCouriersQuery,
  useGetCourierCredentialsByTypeQuery,
  useCreateCourierCredentialsMutation,
  useUpdateCourierCredentialsMutation,
  useToggleCourierCredentialsStatusMutation,
  useDeleteCourierCredentialsMutation,
} = courierCredentialsApi;

export const {
  useGetAvailableCouriersQuery,
  useValidateCourierQuery,
  useCreateCourierOrderMutation,
  useCreateBulkCourierOrdersMutation,
  useGetCourierOrderStatusQuery,
  useCalculateCourierPriceMutation,
} = courierOperationsApi;

export const {
  useCreateOrderWithCourierMutation,
  useUpdateCourierOrderStatusMutation,
  useGetCourierOrderTrackingQuery,
  useCalculateOrderDeliveryPriceMutation,
  useGetAvailableCouriersForOrderQuery,
  useGetCourierOrdersQuery,
  useDeleteCourierOrderMutation,
  useBulkDeleteCourierOrdersMutation,
} = courierOrdersApi;

export const {
  useGetCourierStatsQuery,
  useGetCourierPerformanceQuery,
} = courierStatsApi;
