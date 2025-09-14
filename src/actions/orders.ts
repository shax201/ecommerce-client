"use server";

import { revalidateTag } from "next/cache";

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

// Revalidate orders cache
export async function revalidateOrders() {
  revalidateTag("orders");
}
