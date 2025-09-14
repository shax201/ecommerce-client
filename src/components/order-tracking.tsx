"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from "lucide-react"
import { getOrderTracking, type OrderTracking } from "@/actions/orders"
import { toast } from "sonner"

interface OrderTrackingProps {
  orderId: string;
  onClose?: () => void;
}

export function OrderTracking({ orderId, onClose }: OrderTrackingProps) {
  const [trackingInfo, setTrackingInfo] = React.useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadTracking = async () => {
      setIsLoading(true)
      try {
        const tracking = await getOrderTracking(orderId)
        setTrackingInfo(tracking)
      } catch (error) {
        console.error("Error loading tracking:", error)
        toast.error("Failed to load tracking information")
      } finally {
        setIsLoading(false)
      }
    }
    loadTracking()
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />
      case "processing":
        return <Package className="h-5 w-5 text-yellow-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-gray-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Loading tracking information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trackingInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Unable to load tracking information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Failed to load tracking information</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Tracking</CardTitle>
            <CardDescription>
              Order #{trackingInfo.orderNumber}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Status */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getStatusIcon(trackingInfo.currentStatus)}
              <Badge className={getStatusColor(trackingInfo.currentStatus)}>
                {trackingInfo.currentStatus.charAt(0).toUpperCase() + trackingInfo.currentStatus.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Order #{trackingInfo.orderNumber}
            </p>
          </div>

          {/* Estimated Delivery */}
          {trackingInfo.estimatedDelivery && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-lg font-semibold">
                {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tracking History</h3>
            <div className="space-y-4">
              {trackingInfo.history?.map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                    </div>
                    {index < (trackingInfo.history?.length || 0) - 1 && (
                      <div className="w-0.5 h-8 bg-muted ml-5 -mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">
                        {event.status.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No tracking history available</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">Order Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {["pending", "processing", "shipped", "delivered", "cancelled"].map((step) => {
                const isCompleted = trackingInfo.history?.some(event => event.status === step) || false
                const isCurrent = trackingInfo.currentStatus === step
                return (
                  <div
                    key={step}
                    className={`text-center p-3 rounded-lg border ${
                      isCompleted
                        ? "bg-green-50 border-green-200 text-green-800"
                        : isCurrent
                        ? "bg-blue-50 border-blue-200 text-blue-800"
                        : "bg-muted border-muted text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs font-medium capitalize">
                      {step.replace('_', ' ')}
                    </div>
                    {isCompleted && <CheckCircle className="h-4 w-4 mx-auto mt-1" />}
                    {isCurrent && <Clock className="h-4 w-4 mx-auto mt-1" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

