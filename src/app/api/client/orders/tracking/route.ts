import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const data = {
      orderStatusDistribution: [
        { status: "Pending", count: 3, percentage: 12.5 },
        { status: "Processing", count: 2, percentage: 8.3 },
        { status: "Shipped", count: 4, percentage: 16.7 },
        { status: "Delivered", count: 13, percentage: 54.2 },
        { status: "Canceled", count: 2, percentage: 8.3 },
      ],
      deliveryPerformance: [
        { timeframe: "1-2 days", orders: 8 },
        { timeframe: "3-5 days", orders: 12 },
        { timeframe: "6-7 days", orders: 3 },
        { timeframe: "8+ days", orders: 1 },
      ],
      monthlyTrends: [
        { month: "Jan", orders: 4, avgDeliveryTime: 3.2 },
        { month: "Feb", orders: 6, avgDeliveryTime: 2.8 },
        { month: "Mar", orders: 5, avgDeliveryTime: 3.5 },
        { month: "Apr", orders: 8, avgDeliveryTime: 2.9 },
        { month: "May", orders: 5, avgDeliveryTime: 3.1 },
        { month: "Jun", orders: 6, avgDeliveryTime: 2.7 },
      ],
      activeOrders: [
        {
          id: "ORD-2024-002",
          status: "shipped",
          estimatedDelivery: "2024-01-25",
          progress: 75,
          trackingSteps: [
            { step: "Order Placed", completed: true, date: "2024-01-18" },
            { step: "Processing", completed: true, date: "2024-01-19" },
            { step: "Shipped", completed: true, date: "2024-01-20" },
            { step: "Out for Delivery", completed: false, date: null },
            { step: "Delivered", completed: false, date: null },
          ],
        },
        {
          id: "ORD-2024-003",
          status: "processing",
          estimatedDelivery: "2024-01-28",
          progress: 25,
          trackingSteps: [
            { step: "Order Placed", completed: true, date: "2024-01-20" },
            { step: "Processing", completed: true, date: "2024-01-21" },
            { step: "Shipped", completed: false, date: null },
            { step: "Out for Delivery", completed: false, date: null },
            { step: "Delivered", completed: false, date: null },
          ],
        },
      ],
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tracking data" }, { status: 500 })
  }
}
