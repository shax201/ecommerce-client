"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store";
import {
  useGetCourierOrdersQuery,
  useCreateOrderWithCourierMutation,
  useUpdateCourierOrderStatusMutation,
  useGetCourierOrderTrackingQuery,
  useCalculateOrderDeliveryPriceMutation,
  useGetAvailableCouriersForOrderQuery,
  useDeleteCourierOrderMutation,
  useBulkDeleteCourierOrdersMutation,
} from "@/lib/features/courier";
import {
  setOrderFormOpen,
  setOrderEditMode,
  setEditingOrderId,
  setSelectedOrders,
  setOrderForm,
  clearOrderForm,
  setSearchQuery,
  setCourierFilter,
  setStatusFilter,
  setDateRangeFilter,
  clearFilters,
  setOrdersList,
  setPagination,
  setCurrentPage,
} from "@/lib/features/courier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Eye, Trash2, Search, Filter, X, Package, Truck, MapPin } from "lucide-react";
import { CourierOrder, CourierType } from "@/types/courier.types";
import CourierOrderForm from "./courier-order-form";
import CourierOrderTracking from "./courier-order-tracking";

export default function CourierOrdersManagement() {
  const dispatch = useAppDispatch();
  const {
    orders = { list: [], selectedOrder: null, isOrdersLoading: false, ordersError: null },
    filters = { search: '', courier: undefined, status: undefined, isActive: undefined, dateFrom: undefined, dateTo: undefined },
    pagination = { page: 1, limit: 10, total: 0, totalPages: 0 },
    ui: { selectedOrders = [], isOrderFormOpen = false, isOrderEditMode = false, editingOrderId = null } = {},
  } = useAppSelector((state: RootState) => state.courier);

  // API hooks
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetCourierOrdersQuery({
    page: pagination.page,
    limit: pagination.limit,
    filters,
  });

  const [createOrderWithCourier, { isLoading: isCreating }] = useCreateOrderWithCourierMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateCourierOrderStatusMutation();
  const [calculatePrice, { isLoading: isCalculating }] = useCalculateOrderDeliveryPriceMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteCourierOrderMutation();
  const [bulkDeleteOrders, { isLoading: isBulkDeleting }] = useBulkDeleteCourierOrdersMutation();

  // Local state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [orderToTrack, setOrderToTrack] = useState<string | null>(null);

  // Update Redux state when API data changes
  useEffect(() => {
    if (ordersData?.data) {
      console.log('📦 Courier Orders Data:', ordersData.data);
      dispatch(setOrdersList(ordersData.data.orders));
      dispatch(setPagination({
        page: ordersData.data.page,
        limit: ordersData.data.limit,
        total: ordersData.data.total,
        totalPages: ordersData.data.totalPages,
      }));
    }
  }, [ordersData, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Orders State:', {
      ordersList: orders.list,
      isLoading: isOrdersLoading,
      error: ordersError,
      pagination
    });
  }, [orders.list, isOrdersLoading, ordersError, pagination]);

  // Handlers
  const handleCreateOrder = () => {
    dispatch(clearOrderForm());
    dispatch(setOrderEditMode(false));
    dispatch(setEditingOrderId(null));
    dispatch(setOrderFormOpen(true));
  };

  const handleEditOrder = (order: CourierOrder) => {
    // Implement edit order logic
    console.log('Edit order:', order);
  };

  const handleViewTracking = (orderId: string) => {
    setOrderToTrack(orderId);
    setTrackingDialogOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId).unwrap();
      refetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleCalculatePrice = async (orderId: string, courier: CourierType) => {
    try {
      const result = await calculatePrice({ orderId, courier }).unwrap();
      console.log('Price calculation result:', result);
    } catch (error) {
      console.error('Failed to calculate price:', error);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete).unwrap();
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      refetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    
    try {
      await bulkDeleteOrders(selectedOrders).unwrap();
      dispatch(setSelectedOrders([]));
      refetchOrders();
    } catch (error) {
      console.error('Failed to bulk delete orders:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = (orders.list || []).map(order => order.id);
      dispatch(setSelectedOrders(allIds));
    } else {
      dispatch(setSelectedOrders([]));
    }
  };

  const handleSelectOrder = (id: string, checked: boolean) => {
    if (checked) {
      dispatch(setSelectedOrders([...selectedOrders, id]));
    } else {
      dispatch(setSelectedOrders(selectedOrders.filter(orderId => orderId !== id)));
    }
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleCourierFilter = (value: string) => {
    dispatch(setCourierFilter(value === 'all' ? undefined : value as CourierType));
  };

  const handleStatusFilter = (value: string) => {
    dispatch(setStatusFilter(value === 'all' ? undefined : value));
  };

  const handleDateRangeFilter = (from: string, to: string) => {
    dispatch(setDateRangeFilter({ from, to }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isOrdersLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Courier Orders</h3>
          <p className="text-sm text-muted-foreground">
            Manage courier orders and track deliveries
          </p>
        </div>
        <Button onClick={handleCreateOrder}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search orders..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filters.courier || 'all'} onValueChange={handleCourierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Couriers</SelectItem>
                <SelectItem value="pathao">Pathao</SelectItem>
                <SelectItem value="steadfast">Steadfast</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Input
                type="date"
                placeholder="From date"
                onChange={(e) => handleDateRangeFilter(e.target.value, filters.dateTo || '')}
                className="w-[150px]"
              />
              <Input
                type="date"
                placeholder="To date"
                onChange={(e) => handleDateRangeFilter(filters.dateFrom || '', e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedOrders.length} orders selected
              </span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            View and manage courier orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === (orders.list?.length || 0) && (orders.list?.length || 0) > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Consignment ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery Fee</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isOrdersLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span>Loading courier orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : ordersError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-red-500">
                      <p>Error loading courier orders</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {'message' in ordersError ? ordersError.message : 'Please try again later'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (orders.list || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Package className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">No courier orders found</p>
                      <p className="text-sm text-gray-400">
                        Create your first courier order to get started
                      </p>
                      <Button onClick={handleCreateOrder} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Order
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                (orders.list || []).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{order.orderId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.courier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {order.consignmentId || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">৳{order.deliveryFee || 0}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTracking(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOrderToDelete(order.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(orders.list || []).length} of {pagination.total} orders
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => dispatch(setCurrentPage(pagination.page - 1))}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => dispatch(setCurrentPage(pagination.page + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Form Dialog */}
      <Dialog open={isOrderFormOpen} onOpenChange={(open) => dispatch(setOrderFormOpen(open))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Courier Order</DialogTitle>
            <DialogDescription>
              Create a new courier order for delivery
            </DialogDescription>
          </DialogHeader>
          <CourierOrderForm />
        </DialogContent>
      </Dialog>

      {/* Order Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
            <DialogDescription>
              Track the status and location of your courier order
            </DialogDescription>
          </DialogHeader>
          {orderToTrack && <CourierOrderTracking orderId={orderToTrack} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
