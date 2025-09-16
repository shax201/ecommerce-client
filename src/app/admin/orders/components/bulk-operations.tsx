"use client";

import { useState } from "react";
import { useUpdateOrderStatusMutation, useDeleteOrderMutation } from "@/lib/features/orders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Trash2, 
  Edit, 
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { ExportOrders } from "./export-orders";
import { OrderData } from "@/lib/features/orders/ordersApi";

interface BulkOperationsProps {
  orders: OrderData[];
  selectedOrders: string[];
  onSelectionChange: (orderIds: string[]) => void;
  onRefresh: () => void;
}

export function BulkOperations({ orders, selectedOrders, onSelectionChange, onRefresh }: BulkOperationsProps) {
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;

    setIsProcessing(true);
    try {
      const promises = selectedOrders.map(orderId =>
        updateOrderStatus({
          orderId,
          status: bulkStatus,
        }).unwrap()
      );

      await Promise.all(promises);
      
      toast.success(`Updated ${selectedOrders.length} orders to ${bulkStatus}`);
      onSelectionChange([]);
      onRefresh();
      setIsBulkStatusOpen(false);
      setBulkStatus("");
    } catch (error) {
      console.error("Failed to update order statuses:", error);
      toast.error("Failed to update some orders");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    setIsProcessing(true);
    try {
      const promises = selectedOrders.map(orderId =>
        deleteOrder(orderId).unwrap()
      );

      await Promise.all(promises);
      
      toast.success(`Deleted ${selectedOrders.length} orders`);
      onSelectionChange([]);
      onRefresh();
      setIsBulkDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete orders:", error);
      toast.error("Failed to delete some orders");
    } finally {
      setIsProcessing(false);
    }
  };


  if (selectedOrders.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>No orders selected</span>
        <ExportOrders orders={orders} selectedOrders={[]} />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
      </span>

      <Dialog open={isBulkStatusOpen} onOpenChange={setIsBulkStatusOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Status</DialogTitle>
            <DialogDescription>
              Update the status of {selectedOrders.length} selected orders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
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
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsBulkStatusOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkStatusUpdate}
                disabled={isProcessing || !bulkStatus}
              >
                {isProcessing ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedOrders.length} orders? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsBulkDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Orders"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ExportOrders orders={orders} selectedOrders={selectedOrders} />

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onSelectionChange([])}
      >
        Clear Selection
      </Button>
    </div>
  );
}

interface BulkSelectProps {
  allOrderIds: string[];
  selectedOrders: string[];
  onSelectionChange: (orderIds: string[]) => void;
}

export function BulkSelect({ allOrderIds, selectedOrders, onSelectionChange }: BulkSelectProps) {
  const isAllSelected = selectedOrders.length === allOrderIds.length;
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < allOrderIds.length;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={isAllSelected}
        ref={(el) => {
          if (el) {
            (el as any).indeterminate = isIndeterminate;
          }
        }}
        onCheckedChange={(checked) => {
          onSelectionChange(checked ? allOrderIds : []);
        }}
      />
      <span className="text-sm text-muted-foreground">
        {isAllSelected ? "Deselect All" : "Select All"}
      </span>
    </div>
  );
}
