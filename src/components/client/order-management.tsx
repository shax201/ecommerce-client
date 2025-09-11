"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { OrderTracker } from "./order-tracker";

// Extended mock data for orders
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "pending",
    total: 129.99,
    items: 3,
    shippingAddress: "123 Main St, New York, NY 10001",
    estimatedDelivery: "2024-01-20",
    trackingNumber: "TRK123456789",
    products: [
      { name: "Wireless Headphones", quantity: 1, price: 79.99 },
      { name: "Phone Case", quantity: 2, price: 25.0 },
    ],
    trackingSteps: ["ordered", "processing"],
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "completed",
    total: 89.5,
    items: 2,
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    deliveredDate: "2024-01-14",
    trackingNumber: "TRK987654321",
    products: [
      { name: "Bluetooth Speaker", quantity: 1, price: 59.99 },
      { name: "USB Cable", quantity: 1, price: 29.51 },
    ],
    trackingSteps: ["ordered", "processing", "shipped", "delivered"],
  },
  {
    id: "ORD-003",
    date: "2024-01-08",
    status: "canceled",
    total: 45.0,
    items: 1,
    shippingAddress: "789 Pine St, Chicago, IL 60601",
    canceledDate: "2024-01-09",
    cancelReason: "Customer requested cancellation",
    products: [{ name: "Tablet Stand", quantity: 1, price: 45.0 }],
    trackingSteps: ["ordered", "canceled"],
  },
  {
    id: "ORD-004",
    date: "2024-01-05",
    status: "completed",
    total: 199.99,
    items: 1,
    shippingAddress: "321 Elm St, Miami, FL 33101",
    deliveredDate: "2024-01-10",
    trackingNumber: "TRK456789123",
    products: [{ name: "Smart Watch", quantity: 1, price: 199.99 }],
    trackingSteps: ["ordered", "processing", "shipped", "delivered"],
  },
  {
    id: "ORD-005",
    date: "2024-01-03",
    status: "pending",
    total: 67.48,
    items: 3,
    shippingAddress: "654 Maple Dr, Seattle, WA 98101",
    estimatedDelivery: "2024-01-18",
    trackingNumber: "TRK789123456",
    products: [
      { name: "Wireless Mouse", quantity: 1, price: 29.99 },
      { name: "Mousepad", quantity: 1, price: 12.49 },
      { name: "Screen Cleaner", quantity: 1, price: 25.0 },
    ],
    trackingSteps: ["ordered", "processing"],
  },
];

interface OrderManagementProps {
  className?: string;
}

export function OrderManagement({ className }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof mockOrders)[0] | null
  >(null);
  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user-token="))
          ?.split("=")[1];

        const res = await fetch("http://localhost:5000/api/v1/order/my", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setData(data.data.orders);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  // Filter and sort orders
  const filteredOrders = data
    .filter((order: any) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some((product: any) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (
        a: { date: string | number | Date; total: number },
        b: { date: string | number | Date; total: number }
      ) => {
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
      case "completed":
        return "default";
      case "canceled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusCounts = () => {
    return {
      all: data.length,
      pending: data.filter((o) => o.status === "pending").length,
      completed: data.filter((o) => o.status === "completed").length,
      canceled: data.filter((o) => o.status === "canceled").length,
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
                <SelectItem value="completed">
                  Completed ({statusCounts.completed})
                </SelectItem>
                <SelectItem value="canceled">
                  Canceled ({statusCounts.canceled})
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({statusCounts.completed})
          </TabsTrigger>
          <TabsTrigger value="canceled">
            Canceled ({statusCounts.canceled})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
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
                      <h3 className="font-semibold text-lg">{order.id}</h3>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.trackingSteps[order.trackingSteps]}
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
                          onClick={() => setSelectedOrder(mockOrders[0])}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
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
                                      Order ID:
                                    </span>
                                    <span>{selectedOrder.id}</span>
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
