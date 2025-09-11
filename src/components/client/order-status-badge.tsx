"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle, XCircle, Package, Truck } from "lucide-react"

interface OrderStatusBadgeProps {
  status: "pending" | "processing" | "shipped" | "delivered" | "canceled"
  className?: string
  showIcon?: boolean
}

export function OrderStatusBadge({ status, className, showIcon = true }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        }
      case "processing":
        return {
          label: "Processing",
          variant: "secondary" as const,
          icon: Package,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        }
      case "shipped":
        return {
          label: "Shipped",
          variant: "secondary" as const,
          icon: Truck,
          className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        }
      case "delivered":
        return {
          label: "Delivered",
          variant: "default" as const,
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        }
      case "canceled":
        return {
          label: "Canceled",
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        }
      default:
        return {
          label: "Unknown",
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn("inline-flex items-center gap-1.5 font-medium", config.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  )
}
