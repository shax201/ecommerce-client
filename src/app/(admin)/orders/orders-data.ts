import { OrderData, OrderStatus } from "./orders.interface"

function normalizeStatus(status: any): OrderStatus {
  if (typeof status === "string") {
    if (["processing", "delivered", "cancelled"].includes(status)) {
      return status as OrderStatus
    }
  }
  // fallback for boolean legacy
  if (status === true) return "delivered"
  if (status === false) return "processing"
  return "processing"
}

export async function fetchOrders(): Promise<OrderData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/order`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const data = await response.json()
    if (response.ok && data.success) {
      // Normalize status for all orders
      return data.data.map((order: any) => ({
        ...order,
        status: normalizeStatus(order.status),
      }))
    } else {
      console.error("Failed to fetch orders:", data.message)
      return []
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
} 