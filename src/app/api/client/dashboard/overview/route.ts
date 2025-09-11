import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const data = {
      user: {
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/diverse-user-avatars.png",
        joinDate: "2023-01-15",
        totalOrders: 24,
        totalSpent: 2847.5,
        loyaltyPoints: 1250,
        membershipTier: "Gold",
      },
      metrics: {
        totalOrders: 24,
        pendingOrders: 3,
        completedOrders: 19,
        canceledOrders: 2,
        totalSpent: 2847.5,
        averageOrderValue: 118.65,
        loyaltyPoints: 1250,
      },
      spendingTrends: [
        { month: "Jan", amount: 245 },
        { month: "Feb", amount: 312 },
        { month: "Mar", amount: 189 },
        { month: "Apr", amount: 421 },
        { month: "May", amount: 356 },
        { month: "Jun", amount: 298 },
      ],
      categorySpending: [
        { category: "Electronics", amount: 1250, percentage: 44 },
        { category: "Clothing", amount: 680, percentage: 24 },
        { category: "Books", amount: 420, percentage: 15 },
        { category: "Home & Garden", amount: 320, percentage: 11 },
        { category: "Sports", amount: 177, percentage: 6 },
      ],
      orderAnalytics: [
        { month: "Jan", pending: 2, completed: 4, canceled: 0 },
        { month: "Feb", pending: 1, completed: 5, canceled: 1 },
        { month: "Mar", pending: 3, completed: 2, canceled: 0 },
        { month: "Apr", pending: 2, completed: 6, canceled: 1 },
        { month: "May", pending: 1, completed: 4, canceled: 0 },
        { month: "Jun", pending: 3, completed: 3, canceled: 0 },
      ],
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
