"use client";

import { useState, useEffect } from "react";
import { useGetOrdersQuery } from "@/lib/features/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Truck,
  Home
} from "lucide-react";
import { format } from "date-fns";

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

export function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, error, isLoading } = useGetOrdersQuery();

  const orders = data?.data || [];

  // Debug: Log all unique status values when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const currentStatuses = [...new Set(orders.map(order => order.currentStatus).filter(Boolean))];
      const legacyStatuses = [...new Set(orders.map(order => order.status).filter(Boolean))];
      console.log("Tracking - Available status values:", {
        currentStatuses,
        legacyStatuses,
        totalOrders: orders.length
      });
    }
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      order.currentStatus?.toLowerCase() === statusFilter.toLowerCase() || 
      order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    // Debug logging for tracking
    if (statusFilter !== "all") {
      console.log("Tracking filter debug:", {
        orderId: order._id,
        currentStatus: order.currentStatus,
        status: order.status,
        statusFilter,
        matchesStatus
      });
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
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
    const steps = order.trackingSteps || [];
    const currentStatus = order.currentStatus || order.status || "pending";
    
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
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">Error loading tracking data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or tracking #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status ({orders.length})</SelectItem>
            <SelectItem value="pending">Pending ({orders.filter(o => o.currentStatus?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'pending').length})</SelectItem>
            <SelectItem value="processing">Processing ({orders.filter(o => o.currentStatus?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'processing').length})</SelectItem>
            <SelectItem value="shipped">Shipped ({orders.filter(o => o.currentStatus?.toLowerCase() === 'shipped' || o.status?.toLowerCase() === 'shipped').length})</SelectItem>
            <SelectItem value="delivered">Delivered ({orders.filter(o => o.currentStatus?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'delivered').length})</SelectItem>
            <SelectItem value="cancelled">Cancelled ({orders.filter(o => o.currentStatus?.toLowerCase() === 'cancelled' || o.status?.toLowerCase() === 'cancelled').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Summary */}
      {(searchTerm || statusFilter !== "all") && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Filters active:</span>
          {searchTerm && (
            <Badge variant="outline">Search: "{searchTerm}"</Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="outline">Status: {statusFilter}</Badge>
          )}
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
        </div>
      )}

      {/* Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Order Tracking ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Tracking #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order._id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleOrderClick(order)}
                >
                  <TableCell className="font-medium">
                    {order.orderNumber || order._id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{order.trackingNumber || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.currentStatus || order.status || "pending")}
                      {getStatusBadge(order.currentStatus || order.status || "pending")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{order.clientID?.name || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick(order);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No orders have been placed yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Tracking Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Order #:</span> {selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</p>
                    <p><span className="text-muted-foreground">Tracking #:</span> {selectedOrder.trackingNumber || "N/A"}</p>
                    <p><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedOrder.currentStatus || selectedOrder.status || "pending")}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Customer</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.shipping?.name || "N/A"}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.shipping?.phone || "N/A"}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.shipping?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedOrder.shipping.address}</p>
                    <p>{selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zip}</p>
                    <p>{selectedOrder.shipping.country}</p>
                  </div>
                </div>
              )}

              {/* Tracking Steps */}
              <div>
                <h4 className="font-semibold mb-4">Tracking Progress</h4>
                <div className="space-y-4">
                  {getTrackingSteps(selectedOrder).map((step, index) => (
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
              </div>

              {/* Estimated Delivery */}
              {selectedOrder.estimatedDeliveryDate && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Estimated Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.estimatedDeliveryDate), "EEEE, MMMM dd, yyyy")}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
