"use client";

import { useState } from "react";
import { OrderData } from "@/lib/features/orders/ordersApi";

// Mock data for testing filtering
const mockOrders: OrderData[] = [
  {
    _id: "1",
    orderNumber: "ORD-001",
    date: "2024-01-15T10:30:00Z",
    trackingSteps: ["ordered", "shipped", "delivered"],
    currentStatus: "delivered",
    status: "delivered", // Legacy field
    total: 150.00,
    currency: "USD",
    itemCount: 2,
    trackingNumber: "TRK-001",
    products: [
      { id: "prod1", name: "Test Product 1", quantity: 1, price: 75.00, image: "" }
    ],
    shipping: {
      id: "ship1",
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
      phone: "555-0123",
      email: "john@example.com"
    },
    clientID: {
      _id: "client1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com"
    },
    paymentMethod: "credit_card",
    paymentStatus: true,
    notes: "Test order",
    estimatedDeliveryDate: "2024-01-20T00:00:00Z"
  },
  {
    _id: "2",
    orderNumber: "ORD-002",
    date: "2024-01-16T14:20:00Z",
    trackingSteps: ["ordered", "shipped"],
    currentStatus: "shipped",
    status: "shipped", // Legacy field
    total: 89.99,
    currency: "USD",
    itemCount: 1,
    trackingNumber: "TRK-002",
    products: [
      { id: "prod2", name: "Test Product 2", quantity: 1, price: 89.99, image: "" }
    ],
    shipping: {
      id: "ship2",
      name: "Jane Smith",
      address: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "USA",
      phone: "555-0456",
      email: "jane@example.com"
    },
    clientID: {
      _id: "client2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com"
    },
    paymentMethod: "paypal",
    paymentStatus: true,
    notes: "Test order 2",
    estimatedDeliveryDate: "2024-01-22T00:00:00Z"
  },
  {
    _id: "3",
    orderNumber: "ORD-003",
    date: "2024-01-17T09:15:00Z",
    trackingSteps: ["ordered"],
    currentStatus: "pending",
    status: "pending", // Legacy field
    total: 200.00,
    currency: "USD",
    itemCount: 3,
    trackingNumber: "TRK-003",
    products: [
      { id: "prod3", name: "Test Product 3", quantity: 2, price: 100.00, image: "" }
    ],
    shipping: {
      id: "ship3",
      name: "Bob Johnson",
      address: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
      phone: "555-0789",
      email: "bob@example.com"
    },
    clientID: {
      _id: "client3",
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob@example.com"
    },
    paymentMethod: "stripe",
    paymentStatus: false,
    notes: "Test order 3",
    estimatedDeliveryDate: "2024-01-25T00:00:00Z"
  },
  {
    _id: "4",
    orderNumber: "ORD-004",
    date: "2024-01-18T16:45:00Z",
    trackingSteps: ["ordered", "processing"],
    currentStatus: "processing",
    status: "processing", // Legacy field
    total: 75.50,
    currency: "USD",
    itemCount: 1,
    trackingNumber: "TRK-004",
    products: [
      { id: "prod4", name: "Test Product 4", quantity: 1, price: 75.50, image: "" }
    ],
    shipping: {
      id: "ship4",
      name: "Alice Brown",
      address: "321 Elm St",
      city: "Houston",
      state: "TX",
      zip: "77001",
      country: "USA",
      phone: "555-0321",
      email: "alice@example.com"
    },
    clientID: {
      _id: "client4",
      firstName: "Alice",
      lastName: "Brown",
      email: "alice@example.com"
    },
    paymentMethod: "credit_card",
    paymentStatus: true,
    notes: "Test order 4",
    estimatedDeliveryDate: "2024-01-26T00:00:00Z"
  }
];

export default function TestFilterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products?.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      order.currentStatus?.toLowerCase() === statusFilter.toLowerCase() || 
      order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Filter Test Page</h1>
      
      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {mockOrders.length} orders
          {searchTerm && ` (search: "${searchTerm}")`}
          {statusFilter !== "all" && ` (status: ${statusFilter})`}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.map((order) => (
          <div key={order._id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">{order.shipping?.name}</p>
                <p className="text-sm text-gray-500">
                  Current Status: {order.currentStatus} | Legacy Status: {order.status}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${order.total}</p>
                <p className="text-sm text-gray-500">{order.itemCount} items</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders match the current filters
        </div>
      )}
    </div>
  );
}
