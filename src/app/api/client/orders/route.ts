import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const allOrders = [
      {
        id: "ORD-2024-001",
        date: "2024-01-15",
        status: "delivered",
        total: 299.99,
        items: 3,
        trackingNumber: "TRK123456789",
        estimatedDelivery: "2024-01-20",
        products: [
          {
            name: "Wireless Headphones",
            price: 199.99,
            quantity: 1,
            image: "/diverse-people-listening-headphones.png",
          },
          { name: "Phone Case", price: 29.99, quantity: 2, image: "/placeholder.svg?height=60&width=60" },
        ],
      },
      {
        id: "ORD-2024-002",
        date: "2024-01-18",
        status: "shipped",
        total: 149.5,
        items: 2,
        trackingNumber: "TRK987654321",
        estimatedDelivery: "2024-01-25",
        products: [{ name: "Smart Watch", price: 149.5, quantity: 1, image: "/modern-smartwatch.png" }],
      },
      {
        id: "ORD-2024-003",
        date: "2024-01-20",
        status: "processing",
        total: 89.99,
        items: 1,
        trackingNumber: null,
        estimatedDelivery: "2024-01-28",
        products: [{ name: "Laptop Stand", price: 89.99, quantity: 1, image: "/laptop-stand.png" }],
      },
      {
        id: "ORD-2024-004",
        date: "2024-01-22",
        status: "pending",
        total: 199.99,
        items: 2,
        trackingNumber: null,
        estimatedDelivery: "2024-01-30",
        products: [
          { name: "Wireless Mouse", price: 79.99, quantity: 1, image: "/wireless-mouse.png" },
          { name: "USB Hub", price: 120.0, quantity: 1, image: "/usb-hub.png" },
        ],
      },
      {
        id: "ORD-2024-005",
        date: "2024-01-10",
        status: "canceled",
        total: 59.99,
        items: 1,
        trackingNumber: null,
        estimatedDelivery: null,
        products: [
          { name: "Bluetooth Speaker", price: 59.99, quantity: 1, image: "/placeholder.svg?height=60&width=60" },
        ],
      },
    ]

    // Filter by status if provided
    const filteredOrders = status && status !== "all" ? allOrders.filter((order) => order.status === status) : allOrders

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
