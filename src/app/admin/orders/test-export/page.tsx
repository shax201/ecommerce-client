"use client";

import { ExportOrders } from "../components/export-orders";
import { OrderData } from "@/lib/features/orders/ordersApi";

// Mock data for testing
const mockOrders: OrderData[] = [
  {
    _id: "1",
    orderNumber: "ORD-001",
    date: "2024-01-15T10:30:00Z",
    trackingSteps: [
      { status: "ordered", timestamp: "2024-01-15T10:30:00Z", location: "Warehouse", note: "Order placed" },
      { status: "shipped", timestamp: "2024-01-16T14:20:00Z", location: "Distribution Center", note: "Package shipped" },
      { status: "delivered", timestamp: "2024-01-18T09:15:00Z", location: "Customer Address", note: "Package delivered" }
    ],
    currentStatus: "delivered",
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
    trackingSteps: [
      { status: "ordered", timestamp: "2024-01-16T14:20:00Z", location: "Warehouse", note: "Order placed" },
      { status: "shipped", timestamp: "2024-01-17T10:30:00Z", location: "Distribution Center", note: "Package shipped" }
    ],
    currentStatus: "shipped",
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
  }
];

export default function TestExportPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Export Test Page</h1>
      <p className="mb-4">This page tests the export functionality with mock data.</p>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Export All Orders</h2>
          <ExportOrders orders={mockOrders} selectedOrders={[]} />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Export Selected Orders</h2>
          <ExportOrders orders={mockOrders} selectedOrders={["1"]} />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Mock Data Preview</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(mockOrders, null, 2)}
        </pre>
      </div>
    </div>
  );
}
