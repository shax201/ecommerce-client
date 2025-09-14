"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useGetUserOrdersQuery, useGetOrderTrackingQuery } from "@/lib/features/orders/ordersApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  Eye,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  Truck,
  Loader2,
} from "lucide-react";
import { OrderTracker } from "./order-tracker";

// Helper function to format order data from API
const formatOrderData = (order: any) => {
  if (!order) return null;
  
  return {
    id: order._id || order.id || '',
    orderNumber: order.orderNumber || `ORD-${(order._id || order.id || '').slice(-6)}`,
    date: order.createdAt || order.date || new Date().toISOString(),
    status: order.status || 'pending',
    total: order.totalPrice || order.total || 0,
    items: order.quantity || 1,
    shippingAddress: order.shipping?.address || "Address not available",
    estimatedDelivery: order.estimatedDeliveryDate,
    trackingNumber: order.trackingNumber,
    products: Array.isArray(order.products) ? order.products : (Array.isArray(order.productID) ? order.productID : []),
    trackingSteps: Array.isArray(order.trackingSteps) ? order.trackingSteps : ['ordered'],
    paymentMethod: order.paymentMethod || 'credit_card',
    paymentStatus: Boolean(order.paymentStatus),
    notes: order.notes || '',
  };
};

interface OrderManagementProps {
  className?: string;
}

export function OrderManagement({ className }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Get user from Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Fetch user orders using Redux RTK Query
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useGetUserOrdersQuery({}, {
    skip: !isAuthenticated || !user,
  });

  // Fetch order tracking for selected order
  const { 
    data: trackingData,
    isLoading: trackingLoading 
  } = useGetOrderTrackingQuery(selectedOrder?.id || "", {
    skip: !selectedOrder?.id,
  });

  // Format orders data
  const data = ordersData?.data?.map(formatOrderData).filter(Boolean) || [];

  // Filter and sort orders
  const filteredOrders = data
    .filter((order: any) => {
      if (!order) return false;
      
      const searchTermLower = (searchTerm || "").toLowerCase();
      const matchesSearch = searchTermLower === "" || (
        (order.orderNumber || order.id || "").toLowerCase().includes(searchTermLower) ||
        (order.products || []).some((product: any) =>
          (product.name || product.title || "").toLowerCase().includes(searchTermLower)
        )
      );
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (
        a: any,
        b: any
      ) => {
        if (!a || !b) return 0;
        
        switch (sortBy) {
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case "total-desc":
            return b.total - a.total;
          case "total-asc":
            return a.total - b.total;
          default:
            return 0;
        }
      }
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusCounts = () => {
    const validData = data.filter(Boolean) as any[];
    return {
      all: validData.length,
      pending: validData.filter((o) => o.status === "pending").length,
      processing: validData.filter((o) => o.status === "processing").length,
      shipped: validData.filter((o) => o.status === "shipped").length,
      delivered: validData.filter((o) => o.status === "delivered").length,
      cancelled: validData.filter((o) => o.status === "cancelled").length,
    };
  };

  const statusCounts = getStatusCounts();

  console.log("filteredOrders", filteredOrders);
  return (
    <div className={className}>
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Management
          </CardTitle>
          <CardDescription>
            View, filter, and track all your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Orders ({statusCounts.all})
                </SelectItem>
                <SelectItem value="pending">
                  Pending ({statusCounts.pending})
                </SelectItem>
                <SelectItem value="processing">
                  Processing ({statusCounts.processing})
                </SelectItem>
                <SelectItem value="shipped">
                  Shipped ({statusCounts.shipped})
                </SelectItem>
                <SelectItem value="delivered">
                  Delivered ({statusCounts.delivered})
                </SelectItem>
                <SelectItem value="cancelled">
                  Cancelled ({statusCounts.cancelled})
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="total-desc">Highest Amount</SelectItem>
                <SelectItem value="total-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({statusCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped ({statusCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({statusCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({statusCounts.cancelled})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  Loading orders...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch your orders
                </p>
              </div>
            </CardContent>
          </Card>
        ) : ordersError ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-500">
                  Failed to load orders
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please try refreshing the page
                </p>
              </div>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No orders found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Ordered: {new Date(order.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{order.products.length} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {order.status === "pending" && order.estimatedDelivery && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>
                          Est. delivery:{" "}
                          {new Date(
                            order.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {order.status === "completed" && order.deliveredDate && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <Truck className="h-4 w-4" />
                        <span>
                          Delivered:{" "}
                          {new Date(order.deliveredDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                          <DialogDescription>
                            Complete information about your order
                          </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-6">
                            {/* Order Status Tracking */}
                            <div>
                              <h4 className="font-medium mb-4">Order Status</h4>
                              <OrderTracker
                                steps={selectedOrder.trackingSteps}
                              />
                            </div>

                            <Separator />

                            {/* Order Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">
                                  Order Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Order Number:
                                    </span>
                                    <span>{selectedOrder.orderNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Date:
                                    </span>
                                    <span>
                                      {new Date(
                                        selectedOrder.date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Status:
                                    </span>
                                    <Badge
                                      variant={
                                        getStatusColor(
                                          selectedOrder.status
                                        ) as any
                                      }
                                    >
                                      {selectedOrder.status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Total:
                                    </span>
                                    <span className="font-medium">
                                      ${selectedOrder.total.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Payment:
                                    </span>
                                    <span>
                                      {selectedOrder.paymentMethod?.replace('_', ' ')} 
                                      {selectedOrder.paymentStatus ? ' ✓' : ' ✗'}
                                    </span>
                                  </div>
                                  {selectedOrder.trackingNumber && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Tracking:
                                      </span>
                                      <span className="font-mono">
                                        {selectedOrder.trackingNumber}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">
                                  Shipping Address
                                </h4>
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <span>{selectedOrder.shippingAddress}</span>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Products */}
                            {/* <div>
                              <h4 className="font-medium mb-4">
                                Products ({selectedOrder.items} items)
                              </h4>
                              <div className="space-y-3">
                                {selectedOrder.products.map(
                                  (product, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                                    >
                                      <div>
                                        <p className="font-medium">
                                          {product.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Quantity: {product.quantity}
                                        </p>
                                      </div>
                                      <p className="font-medium">
                                        ${product.price.toFixed(2)}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t mt-4">
                                <span className="font-medium">Total:</span>
                                <span className="text-lg font-bold">
                                  ${selectedOrder.total.toFixed(2)}
                                </span>
                              </div>
                            </div> */}

                            {/* Additional Information */}
                            {/* {selectedOrder.status === "canceled" &&
                              selectedOrder.cancelReason && (
                                <>
                                  <Separator />
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Cancellation Reason
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedOrder.cancelReason}
                                    </p>
                                  </div>
                                </>
                              )} */}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
