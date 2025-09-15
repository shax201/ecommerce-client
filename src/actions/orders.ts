"use server";

import { revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { ISR_TAGS } from "@/lib/isr-tags";


const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
};

// Types for order data
export interface OrderData {
  id?: string;
  _id?: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
  currentStatus?: string;
  status?: string;
  itemCount?: number;
  quantity?: number;
  total?: number;
  totalPrice?: number;
  currency?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  products?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderResponse {
  success: boolean;
  data: OrderData[];
  pagination?: {
    hasNext: boolean;
    page: number;
    limit: number;
    total: number;
  };
  message?: string;
}

export interface OrderTracking {
  orderNumber: string;
  currentStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  history?: Array<{
    status: string;
    date: string;
    location?: string;
  }>;
}

// Mock data for development
const mockOrders: OrderData[] = [
  {
    id: "1",
    _id: "order_1",
    orderNumber: "ORD-001",
    date: "2024-01-15",
    createdAt: "2024-01-15T10:30:00Z",
    currentStatus: "delivered",
    status: "delivered",
    itemCount: 2,
    quantity: 2,
    total: 89.99,
    totalPrice: 89.99,
    currency: "$",
    paymentMethod: "credit_card",
    trackingNumber: "TRK123456789",
    products: [
      { name: "Classic T-Shirt", quantity: 1, price: 29.99 },
      { name: "Denim Jeans", quantity: 1, price: 59.99 }
    ]
  },
  {
    id: "2",
    _id: "order_2",
    orderNumber: "ORD-002",
    date: "2024-01-20",
    createdAt: "2024-01-20T14:15:00Z",
    currentStatus: "shipped",
    status: "shipped",
    itemCount: 1,
    quantity: 1,
    total: 45.50,
    totalPrice: 45.50,
    currency: "$",
    paymentMethod: "paypal",
    trackingNumber: "TRK987654321",
    products: [
      { name: "Summer Dress", quantity: 1, price: 45.50 }
    ]
  },
  {
    id: "3",
    _id: "order_3",
    orderNumber: "ORD-003",
    date: "2024-01-25",
    createdAt: "2024-01-25T09:45:00Z",
    currentStatus: "processing",
    status: "processing",
    itemCount: 3,
    quantity: 3,
    total: 125.75,
    totalPrice: 125.75,
    currency: "$",
    paymentMethod: "credit_card",
    products: [
      { name: "Winter Jacket", quantity: 1, price: 79.99 },
      { name: "Wool Scarf", quantity: 1, price: 25.99 },
      { name: "Leather Gloves", quantity: 1, price: 19.77 }
    ]
  }
];

// Get user orders
export async function getUserOrders(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}
): Promise<OrderResponse> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredOrders = [...mockOrders];

    // Apply search filter
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.products?.some(product =>
          product.name.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply status filter
    if (options.status) {
      filteredOrders = filteredOrders.filter(order =>
        order.currentStatus === options.status || order.status === options.status
      );
    }

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedOrders,
      pagination: {
        hasNext: endIndex < filteredOrders.length,
        page,
        limit,
        total: filteredOrders.length
      }
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch orders"
    };
  }
}

// Get order tracking information
export async function getOrderTracking(orderId: string): Promise<OrderTracking | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find the order
    const order = mockOrders.find(o => o.id === orderId || o._id === orderId);
    if (!order) {
      return null;
    }

    return {
      orderNumber: order.orderNumber || order.id || order._id || "",
      currentStatus: order.currentStatus || order.status || "pending",
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.currentStatus === "shipped" ? "2024-02-01" : undefined,
      history: [
        {
          status: "order_placed",
          date: order.createdAt || order.date || "",
          location: "Online Store"
        },
        {
          status: "processing",
          date: order.createdAt || order.date || "",
          location: "Warehouse"
        },
        ...(order.currentStatus === "shipped" || order.currentStatus === "delivered" ? [{
          status: "shipped",
          date: order.createdAt || order.date || "",
          location: "Shipping Center"
        }] : []),
        ...(order.currentStatus === "delivered" ? [{
          status: "delivered",
          date: order.createdAt || order.date || "",
          location: "Customer Address"
        }] : [])
      ]
    };
  } catch (error) {
    console.error("Error fetching order tracking:", error);
    return null;
  }
}

// ===== ISR-ENABLED FUNCTIONS =====

// Cached function for fetching all orders (admin)
export const getOrdersISR = unstable_cache(
  async (): Promise<OrderResponse> => {
    try {
      const response = await fetch(`${getBackendUrl()}/orders`, {
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
          message: data.message || "Orders fetched successfully",
          data: data.data || [],
          pagination: data.pagination,
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch orders",
          data: [],
        };
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {
        success: false,
        message: "Failed to fetch orders",
        data: [],
      };
    }
  },
  ["orders"],
  {
    tags: [ISR_TAGS.ORDERS],
    revalidate: 60, // 1 minute
  }
);

// Cached function for fetching user orders
export const getUserOrdersISR = unstable_cache(
  async (userId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<OrderResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.set('page', options.page.toString());
      if (options.limit) queryParams.set('limit', options.limit.toString());
      if (options.search) queryParams.set('search', options.search);
      if (options.status) queryParams.set('status', options.status);

      const url = `${getBackendUrl()}/orders/user/${userId}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 30 },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || "User orders fetched successfully",
          data: data.data || [],
          pagination: data.pagination,
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch user orders",
          data: [],
        };
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return {
        success: false,
        message: "Failed to fetch user orders",
        data: [],
      };
    }
  },
  ["user-orders"],
  {
    tags: [ISR_TAGS.USER_ORDERS],
    revalidate: 30, // 30 seconds for user-specific data
  }
);

// Cached function for fetching single order
export const getOrderByIdISR = unstable_cache(
  async (orderId: string): Promise<OrderData | null> => {
    try {
      const response = await fetch(`${getBackendUrl()}/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error("Failed to fetch order:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  },
  ["order"],
  {
    tags: [ISR_TAGS.ORDERS],
    revalidate: 60, // 1 minute
  }
);

// Cached function for fetching order analytics
export const getOrderAnalyticsISR = unstable_cache(
  async (): Promise<any> => {
    try {
      const response = await fetch(`${getBackendUrl()}/orders/analytics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error("Failed to fetch order analytics:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching order analytics:", error);
      return null;
    }
  },
  ["order-analytics"],
  {
    tags: [ISR_TAGS.ORDER_ANALYTICS],
    revalidate: 300, // 5 minutes for analytics
  }
);

// Cached function for fetching order tracking
export const getOrderTrackingISR = unstable_cache(
  async (orderId: string): Promise<OrderTracking | null> => {
    try {
      const response = await fetch(`${getBackendUrl()}/orders/${orderId}/tracking`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error("Failed to fetch order tracking:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching order tracking:", error);
      return null;
    }
  },
  ["order-tracking"],
  {
    tags: [ISR_TAGS.ORDER_TRACKING],
    revalidate: 60, // 1 minute
  }
);

// Revalidate orders cache
export async function revalidateOrders() {
  revalidateTag(ISR_TAGS.ORDERS);
}

// Revalidate user orders cache
export async function revalidateUserOrders() {
  revalidateTag(ISR_TAGS.USER_ORDERS);
}

// Revalidate order analytics cache
export async function revalidateOrderAnalytics() {
  revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
}

// ===== SERVER ACTIONS FOR CACHE INVALIDATION =====

// Server action to handle order creation with cache invalidation
export async function createOrderWithCacheInvalidation(orderData: any) {
  try {
    // Call your backend API
    const response = await fetch(`${getBackendUrl()}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful creation
      revalidateTag(ISR_TAGS.ORDERS);
      revalidateTag(ISR_TAGS.USER_ORDERS);
      revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
      
      return {
        success: true,
        data: data.data,
        message: data.message || "Order created successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create order",
      };
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "Failed to create order",
    };
  }
}

// Server action to handle order update with cache invalidation
export async function updateOrderWithCacheInvalidation(orderId: string, updateData: any) {
  try {
    const response = await fetch(`${getBackendUrl()}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful update
      revalidateTag(ISR_TAGS.ORDERS);
      revalidateTag(ISR_TAGS.USER_ORDERS);
      revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
      
      return {
        success: true,
        data: data.data,
        message: data.message || "Order updated successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update order",
      };
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      success: false,
      message: "Failed to update order",
    };
  }
}

// Server action to handle order status update with cache invalidation
export async function updateOrderStatusWithCacheInvalidation(orderId: string, status: string) {
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
      revalidateTag(ISR_TAGS.USER_ORDERS);
      revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
      
      return {
        success: true,
        data: data.data,
        message: data.message || "Order status updated successfully",
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
      message: "Failed to update order status",
    };
  }
}

// Server action to handle order deletion with cache invalidation
export async function deleteOrderWithCacheInvalidation(orderId: string) {
  try {
    const response = await fetch(`${getBackendUrl()}/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Invalidate ISR cache after successful deletion
      revalidateTag(ISR_TAGS.ORDERS);
      revalidateTag(ISR_TAGS.USER_ORDERS);
      revalidateTag(ISR_TAGS.ORDER_ANALYTICS);
      
      return {
        success: true,
        message: data.message || "Order deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to delete order",
      };
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      message: "Failed to delete order",
    };
  }
}
