"use client";

import { useParams } from "next/navigation";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/lib/features/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Home,
  DollarSign,
  Edit,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusIcons = {
  pending: Clock,
  processing: AlertCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertCircle,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data, error, isLoading } = useGetOrderByIdQuery(orderId);
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const order = data?.data;

  const handleStatusUpdate = async () => {
    if (!order || !status) return;
    
    try {
      await updateOrderStatus({
        orderId: order._id,
        status: status,
      }).unwrap();
      setIsEditing(false);
      setStatus("");
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof statusColors;
    return (
      <Badge className={statusColors[statusKey] || "bg-gray-100 text-gray-800"}>
        {statusLabels[statusKey] || status}
      </Badge>
    );
  };

  const getTrackingSteps = (order: any) => {
    const steps = order?.trackingSteps || [];
    const currentStatus = order?.currentStatus || order?.status || "pending";
    
    const allSteps = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = allSteps.indexOf(currentStatus);
    
    return allSteps.map((step, index) => ({
      status: step,
      completed: index <= currentIndex,
      current: index === currentIndex,
      timestamp: index <= currentIndex ? new Date().toISOString() : null,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link href="/orders">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Order not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Order #{order.orderNumber || order._id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Placed on {order.date ? format(new Date(order.date), "MMMM dd, yyyy 'at' h:mm a") : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.currentStatus || order.status || "pending")}
          {getStatusBadge(order.currentStatus || order.status || "pending")}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order Number:</span>
                <p className="font-medium">{order.orderNumber || order._id.slice(-8)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tracking Number:</span>
                <p className="font-medium">{order.trackingNumber || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Method:</span>
                <p className="font-medium">{order.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Status:</span>
                <p className="font-medium">
                  {order.paymentStatus ? "Paid" : "Pending"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <p className="font-medium text-lg">
                  ${order.total || order.totalPrice || 0}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Items:</span>
                <p className="font-medium">{order.itemCount || order.quantity || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.shipping ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{order.shipping.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{order.shipping.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{order.shipping.phone || "N/A"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No customer information available</p>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.shipping ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shipping.name}</p>
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
                <p>{order.shipping.country}</p>
                {order.shipping.phone && (
                  <p className="text-muted-foreground">{order.shipping.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No shipping address available</p>
            )}
          </CardContent>
        </Card>

        {/* Order Status Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.currentStatus || order.status || "pending")}
                  {getStatusBadge(order.currentStatus || order.status || "pending")}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status change..."
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || !status}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsEditing(false);
                      setStatus("");
                      setNotes("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      {order.products && order.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Products ({order.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((product: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price}</p>
                    <p className="text-sm text-muted-foreground">Qty: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Tracking Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTrackingSteps(order).map((step, index) => (
              <div key={step.status} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? step.current 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      step.current ? "text-primary" : step.completed ? "text-green-600" : "text-muted-foreground"
                    }`}>
                      {statusLabels[step.status as keyof typeof statusLabels] || step.status}
                    </span>
                    {step.current && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(step.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estimated Delivery */}
      {order.estimatedDeliveryDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Estimated Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {format(new Date(order.estimatedDeliveryDate), "EEEE, MMMM dd, yyyy")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
