"use client"

import { cn } from "@/lib/utils"
import { Check, Clock, Package, Truck, MapPin, XCircle } from "lucide-react"

interface OrderTrackerProps {
  steps: string[]
  className?: string
}

const trackingSteps = [
  {
    key: "ordered",
    label: "Order Placed",
    description: "Your order has been received",
    icon: Package,
  },
  {
    key: "processing",
    label: "Processing",
    description: "We're preparing your order",
    icon: Clock,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order has been delivered",
    icon: MapPin,
  },
  {
    key: "canceled",
    label: "Canceled",
    description: "Order has been canceled",
    icon: XCircle,
  },
]

export function OrderTracker({ steps, className }: OrderTrackerProps) {
  const isCanceled = steps.includes("canceled")
  const currentStepIndex = isCanceled
    ? trackingSteps.findIndex((step) => step.key === "canceled")
    : Math.max(...steps.map((step) => trackingSteps.findIndex((s) => s.key === step)))

  const getStepStatus = (stepIndex: number, stepKey: string) => {
    if (isCanceled) {
      if (stepKey === "canceled") return "current"
      if (stepKey === "ordered") return "completed"
      return "upcoming"
    }

    if (steps.includes(stepKey)) {
      return stepIndex === currentStepIndex ? "current" : "completed"
    }
    return "upcoming"
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-200"
      case "current":
        return isCanceled ? "text-red-600 bg-red-100 border-red-200" : "text-blue-600 bg-blue-100 border-blue-200"
      case "upcoming":
        return "text-gray-400 bg-gray-100 border-gray-200"
      default:
        return "text-gray-400 bg-gray-100 border-gray-200"
    }
  }

  const getConnectorColor = (stepIndex: number) => {
    if (isCanceled && stepIndex === 0) {
      return "bg-red-200"
    }
    return stepIndex <= currentStepIndex ? "bg-green-200" : "bg-gray-200"
  }

  // Filter steps to show only relevant ones
  const relevantSteps = isCanceled
    ? trackingSteps.filter((step) => step.key === "ordered" || step.key === "canceled")
    : trackingSteps.filter((step) => step.key !== "canceled")

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {relevantSteps.map((step, index) => {
          const status = getStepStatus(index, step.key)
          const Icon = step.icon
          const isLast = index === relevantSteps.length - 1

          return (
            <div key={step.key} className="relative flex items-start">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 -ml-px">
                  <div className={cn("w-full h-full", getConnectorColor(index))} />
                </div>
              )}

              {/* Step Content */}
              <div className="flex items-start space-x-4 pb-8">
                {/* Icon Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200",
                    getStepColor(status),
                  )}
                >
                  {status === "completed" && !isCanceled ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={cn(
                        "text-sm font-medium",
                        status === "completed"
                          ? "text-green-900"
                          : status === "current"
                            ? isCanceled
                              ? "text-red-900"
                              : "text-blue-900"
                            : "text-gray-500",
                      )}
                    >
                      {step.label}
                    </h4>
                    {status === "current" && (
                      <div
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          isCanceled ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800",
                        )}
                      >
                        {isCanceled ? "Canceled" : "Current"}
                      </div>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm mt-1",
                      status === "completed"
                        ? "text-green-700"
                        : status === "current"
                          ? isCanceled
                            ? "text-red-700"
                            : "text-blue-700"
                          : "text-gray-500",
                    )}
                  >
                    {step.description}
                  </p>

                  {/* Additional Status Information */}
                  {status === "current" && !isCanceled && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-xs text-blue-600 font-medium">In Progress</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 ease-out", isCanceled ? "bg-red-400" : "bg-green-400")}
          style={{
            width: isCanceled ? "25%" : `${((currentStepIndex + 1) / relevantSteps.length) * 100}%`,
          }}
        />
      </div>

      {/* Progress Text */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{isCanceled ? "Order Canceled" : `Step ${currentStepIndex + 1} of ${relevantSteps.length}`}</span>
        <span>
          {isCanceled ? "0%" : `${Math.round(((currentStepIndex + 1) / relevantSteps.length) * 100)}% Complete`}
        </span>
      </div>
    </div>
  )
}
