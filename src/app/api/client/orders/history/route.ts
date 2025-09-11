import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "6months"
    const category = searchParams.get("category") || "all"

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 350))

    const data = {
      spendingHistory: [
        { month: "Jul 2023", amount: 189 },
        { month: "Aug 2023", amount: 245 },
        { month: "Sep 2023", amount: 312 },
        { month: "Oct 2023", amount: 278 },
        { month: "Nov 2023", amount: 421 },
        { month: "Dec 2023", amount: 356 },
        { month: "Jan 2024", amount: 298 },
      ],
      categoryBreakdown: [
        { category: "Electronics", amount: 1250, orders: 8, percentage: 44 },
        { category: "Clothing", amount: 680, orders: 12, percentage: 24 },
        { category: "Books", amount: 420, orders: 15, percentage: 15 },
        { category: "Home & Garden", amount: 320, orders: 6, percentage: 11 },
        { category: "Sports", amount: 177, orders: 4, percentage: 6 },
      ],
      recentTransactions: [
        {
          id: "TXN-2024-001",
          orderId: "ORD-2024-001",
          date: "2024-01-15",
          amount: 299.99,
          status: "completed",
          paymentMethod: "Credit Card",
          description: "Wireless Headphones + Phone Case",
        },
        {
          id: "TXN-2024-002",
          orderId: "ORD-2024-002",
          date: "2024-01-18",
          amount: 149.5,
          status: "completed",
          paymentMethod: "PayPal",
          description: "Smart Watch",
        },
        {
          id: "TXN-2024-003",
          orderId: "ORD-2024-003",
          date: "2024-01-20",
          amount: 89.99,
          status: "pending",
          paymentMethod: "Credit Card",
          description: "Laptop Stand",
        },
      ],
      summary: {
        totalTransactions: 24,
        totalAmount: 2847.5,
        averageOrderValue: 118.65,
        mostPopularCategory: "Electronics",
        favoritePaymentMethod: "Credit Card",
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order history" }, { status: 500 })
  }
}
