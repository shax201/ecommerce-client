"use client";

import { useGetCourierOrderTrackingQuery } from "@/lib/features/courier";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Package, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface CourierOrderTrackingProps {
  orderId: string;
}

export default function CourierOrderTracking({ orderId }: CourierOrderTrackingProps) {
  const {
    data: trackingData,
    isLoading,
    error,
  } = useGetCourierOrderTrackingQuery(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    console.error('❌ Tracking Error:', error);
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600">Tracking Error</h3>
        <p className="text-sm text-muted-foreground">
          Unable to load tracking information for this order.
        </p>
        <p className="text-xs text-red-400 mt-2">
          Error: {'message' in error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!trackingData?.data) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-600">No Data</h3>
        <p className="text-sm text-muted-foreground">
          No tracking data available for this order.
        </p>
      </div>
    );
  }

  const order = trackingData.data;
  const trackingSteps = order.courierTrackingSteps || order.trackingSteps || [];
  
  // Debug logging
  console.log('🔍 Tracking Data:', {
    orderId,
    trackingData,
    order,
    trackingSteps
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
      case 'in_transit':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
      case 'in_transit':
        return 'default';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      case 'pending':
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-medium">{order.orderNumber || order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consignment ID</p>
              <p className="font-mono text-sm">{order.consignmentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courier</p>
              <Badge variant="outline" className="capitalize">
                {order.courier}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Fee</p>
              <p className="font-medium">৳{order.deliveryFee || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium">
                {order.estimatedDelivery ? 
                  new Date(order.estimatedDelivery).toLocaleDateString() : 
                  'Not available'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Steps */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Tracking History</span>
          </CardTitle>
          <CardDescription>
            Track the progress of your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trackingSteps.length > 0 ? (
            <div className="space-y-4">
              {trackingSteps.map((step: any, index: number) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium capitalize">{step.status}</p>
                      <Badge variant={getStatusBadgeVariant(step.status)}>
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                    {step.location && (
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {step.location}
                      </p>
                    )}
                    {step.note && (
                      <p className="text-sm mt-1">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No Tracking Information</h3>
              <p className="text-sm text-muted-foreground">
                Tracking information is not available for this order yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Additional Information */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p>{new Date(order.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
