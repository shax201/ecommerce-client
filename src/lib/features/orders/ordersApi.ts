import { apiSlice } from "../api/apiSlice";

// ===== TYPES =====

export interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderShipping {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email?: string;
}

export interface OrderClient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrderData {
  _id: string;
  orderNumber: string;
  date: string;
  trackingSteps: string[];
  currentStatus: string;
  total: number;
  currency: string;
  itemCount: number;
  trackingNumber: string;
  products: OrderProduct[];
  shipping: OrderShipping | null;
  clientID: OrderClient | string;
  paymentMethod: string;
  paymentStatus: boolean;
  notes?: string;
  estimatedDeliveryDate?: string;
  // Legacy fields for backward compatibility
  productID?: string[];
  quantity?: number;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface OrderAnalytics {
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
}

export interface OrderTracking {
  orderId: string;
  trackingNumber: string;
  status: string;
  steps: Array<{
    status: string;
    timestamp: string;
    location?: string;
    description?: string;
  }>;
  estimatedDelivery?: string;
}

export interface CreateOrderData {
  user: string;
  productID: string[];
  paymentMethod: string;
  totalPrice: number;
  quantity: number;
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
  };
  cardDetails?: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardName: string;
  };
}

export interface UpdateOrderData {
  status?: string;
  trackingNumber?: string;
  notes?: string;
  estimatedDeliveryDate?: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: OrderData[];
}

export interface SingleOrderResponse {
  success: boolean;
  message: string;
  data: OrderData;
}

export interface OrderAnalyticsResponse {
  success: boolean;
  message: string;
  data: OrderAnalytics;
}

export interface OrderTrackingResponse {
  success: boolean;
  message: string;
  data: OrderTracking;
}

// ===== API ENDPOINTS =====

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all orders (admin)
    getOrders: builder.query<OrdersResponse, void>({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // Get user orders
    getUserOrders: builder.query<OrdersResponse, { userId?: string }>({
      query: ({ userId }) => ({
        url: userId ? `/orders/user/${userId}` : "/orders/user",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // Get order by ID
    getOrderById: builder.query<SingleOrderResponse, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),

    // Get order analytics
    getOrderAnalytics: builder.query<OrderAnalyticsResponse, void>({
      query: () => ({
        url: "/orders/analytics",
        method: "GET",
      }),
      providesTags: ["OrderAnalytics"],
    }),

    // Get order tracking
    getOrderTracking: builder.query<OrderTrackingResponse, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/tracking`,
        method: "GET",
      }),
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),

    // Create order
    createOrder: builder.mutation<SingleOrderResponse, CreateOrderData>({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order", "OrderAnalytics"],
    }),

    // Update order
    updateOrder: builder.mutation<SingleOrderResponse, { orderId: string; data: UpdateOrderData }>({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
        "OrderAnalytics",
      ],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<SingleOrderResponse, { orderId: string; status: string }>({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
        "OrderAnalytics",
      ],
    }),

    // Delete order
    deleteOrder: builder.mutation<{ success: boolean; message: string }, string>({
      query: (orderId) => {
        console.log("🗑️ [API] Delete order request for ID:", orderId);
        return {
          url: `/orders/${orderId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error, orderId) => [
        { type: "Order", id: orderId },
        "Order",
        "OrderAnalytics",
      ],
    }),
  }),
});

// ===== EXPORTED HOOKS =====

export const {
  useGetOrdersQuery,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderAnalyticsQuery,
  useGetOrderTrackingQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;
