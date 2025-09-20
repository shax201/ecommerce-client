"use client";

import { useState, useEffect } from "react";
import { useGetOrdersQuery } from "@/lib/features/orders";
import { OrderData } from "@/lib/features/orders/ordersApi";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  Calendar,
  DollarSign,
  User,
  MapPin
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations, BulkSelect } from "./bulk-operations";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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

interface OrderListProps {
  orders: OrderData[];
  selectedOrders: string[];
  onSelectionChange: (orderIds: string[]) => void;
  onOrderSelect?: (order: OrderData) => void;
}

export function OrdersList({ orders, selectedOrders, onSelectionChange, onOrderSelect }: OrderListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Debug: Log all unique status values when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const currentStatuses = [...new Set(orders.map(order => order.currentStatus).filter(Boolean))];
      const legacyStatuses = [...new Set(orders.map(order => order.status).filter(Boolean))];
      console.log("Available status values:", {
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
      order.products?.some((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      order.currentStatus?.toLowerCase() === statusFilter.toLowerCase() || 
      order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    // Debug logging
    if (statusFilter !== "all") {
      console.log("Filter debug:", {
        orderId: order._id,
        currentStatus: order.currentStatus,
        status: order.status,
        statusFilter,
        matchesStatus
      });
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleOrderClick = (order: OrderData) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    onOrderSelect?.(order);
  };

  const handleViewDetails = (order: OrderData) => {
    router.push(`/admin/orders/${order._id}`);
  };

  const handleEditOrder = (order: OrderData) => {
    router.push(`/admin/orders/${order._id}/edit`);
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof statusColors;
    return (
      <Badge className={statusColors[statusKey] || "bg-gray-100 text-gray-800"}>
        {statusLabels[statusKey] || status}
      </Badge>
    );
  };


  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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

      {/* Bulk Operations */}
      <div className="flex items-center justify-between">
        <BulkSelect
          allOrderIds={filteredOrders.map(order => order._id)}
          selectedOrders={selectedOrders}
          onSelectionChange={onSelectionChange}
        />
        <BulkOperations
          orders={orders}
          selectedOrders={selectedOrders}
          onSelectionChange={onSelectionChange}
          onRefresh={() => window.location.reload()}
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectionChange(filteredOrders.map(order => order._id));
                      } else {
                        onSelectionChange([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order._id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleOrderClick(order)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedOrders.includes(order._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectionChange([...selectedOrders, order._id]);
                        } else {
                          onSelectionChange(selectedOrders.filter(id => id !== order._id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.orderNumber || order._id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.shipping?.name || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {order.date ? format(new Date(order.date), "MMM dd, yyyy") : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.currentStatus || order.status || "pending")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${order.total || order.totalPrice || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{order.itemCount || order.quantity || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Order Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {getStatusBadge(selectedOrder.currentStatus || selectedOrder.status || "pending")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${selectedOrder.total || selectedOrder.totalPrice || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items: {selectedOrder.itemCount || selectedOrder.quantity || 0}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Customer</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping?.name || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping?.email || "N/A"}
                  </p>
                </div>
              </div>
              
              {selectedOrder.products && selectedOrder.products.length > 0 && (
                <div>
                  <h4 className="font-semibold">Products</h4>
                  <div className="space-y-2">
                    {selectedOrder.products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{product.name}</span>
                        <span>Qty: {product.quantity} × ${product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
