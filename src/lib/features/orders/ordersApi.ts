import { apiSlice } from "../api/apiSlice";

// Order types
export interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  currentStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
  clientID: {
    _id: string;
    name: string;
    email: string;
  };
  productID: Array<{
    _id: string;
    name: string;
    price: number;
  }>;
  quantity: number;
  paymentMethod: string;
  paymentStatus: boolean;
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  trackingSteps?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  courierBooking?: 'pathao' | 'steadfast';
  courierStatus?: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned' | 'cancelled';
  consignmentId?: string;
  courierDeliveryFee?: number;
  courierEstimatedDelivery?: string;
  courierTrackingSteps?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Extended order interface for frontend components
export interface OrderData {
  _id: string;
  orderNumber?: string;
  orderId?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  currentStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total?: number;
  totalPrice?: number;
  currency?: string;
  itemCount?: number;
  quantity?: number;
  trackingNumber?: string;
  paymentMethod?: string;
  paymentStatus?: boolean;
  notes?: string;
  estimatedDeliveryDate?: string;
  trackingSteps?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  products?: Array<{
    id?: string;
    _id?: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shipping?: {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  clientID?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
  } | string;
  courierBooking?: 'pathao' | 'steadfast';
  courierStatus?: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned' | 'cancelled';
  consignmentId?: string;
  courierDeliveryFee?: number;
  courierEstimatedDelivery?: string;
  courierTrackingSteps?: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  category?: string;
  sort?: string;
}

// Orders API slice
export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all orders
    getOrders: builder.query<OrdersResponse, OrderQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.status) searchParams.append('status', params.status);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.category) searchParams.append('category', params.category);
        if (params?.sort) searchParams.append('sort', params.sort);

        return {
          url: `/orders?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Orders'],
    }),

    // Get orders by status (for courier integration)
    getOrdersByStatus: builder.query<OrdersResponse, string[]>({
      query: (statuses) => {
        const statusParam = statuses.join(',');
        return {
          url: `/orders?status=${statusParam}`,
          method: 'GET',
        };
      },
      providesTags: ['Orders'],
    }),

    // Get order by ID
    getOrderById: builder.query<{ success: boolean; data: Order; message: string }, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [
        { type: 'Orders', id },
      ],
    }),

    // Get user orders
    getUserOrders: builder.query<OrdersResponse, OrderQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.status) searchParams.append('status', params.status);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.category) searchParams.append('category', params.category);
        if (params?.sort) searchParams.append('sort', params.sort);

        return {
          url: `/orders/user?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Orders'],
    }),

    // Update order
    updateOrder: builder.mutation<{ success: boolean; data: Order; message: string }, {
      id: string;
      data: any;
    }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Orders', id },
        'Orders',
      ],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<{ success: boolean; data: Order; message: string }, {
      id: string;
      status: string;
      notes?: string;
    }>({
      query: ({ id, status, notes }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Orders', id },
        'Orders',
      ],
    }),

    // Get order tracking
    getOrderTracking: builder.query<{ success: boolean; data: any; message: string }, string>({
      query: (id) => ({
        url: `/orders/${id}/tracking`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [
        { type: 'Orders', id },
      ],
    }),

    // Get order analytics
    getOrderAnalytics: builder.query<{ success: boolean; data: any; message: string }, void>({
      query: () => ({
        url: '/orders/analytics',
        method: 'GET',
      }),
      providesTags: ['Orders'],
    }),

    // Delete order
    deleteOrder: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersByStatusQuery,
  useGetOrderByIdQuery,
  useGetUserOrdersQuery,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetOrderTrackingQuery,
  useGetOrderAnalyticsQuery,
  useDeleteOrderMutation,
} = ordersApi;