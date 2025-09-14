"use client";

import { useState } from "react";
import { OrderData } from "@/lib/features/orders/ordersApi";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download,
  FileText,
  Table,
  Calendar,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface ExportOrdersProps {
  orders: OrderData[];
  selectedOrders?: string[];
}

export function ExportOrders({ orders, selectedOrders = [] }: ExportOrdersProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportFields, setExportFields] = useState({
    orderNumber: true,
    customerName: true,
    customerEmail: true,
    date: true,
    status: true,
    total: true,
    items: true,
    paymentMethod: true,
    trackingNumber: true,
  });
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const availableFields = [
    { key: "orderNumber", label: "Order Number" },
    { key: "customerName", label: "Customer Name" },
    { key: "customerEmail", label: "Customer Email" },
    { key: "date", label: "Order Date" },
    { key: "status", label: "Status" },
    { key: "total", label: "Total Amount" },
    { key: "items", label: "Items Count" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "trackingNumber", label: "Tracking Number" },
  ];

  const getOrdersToExport = () => {
    let ordersToExport = [...orders]; // Create a copy to avoid mutating the original array

    // Filter by selected orders if any
    if (selectedOrders.length > 0) {
      ordersToExport = orders.filter(order => selectedOrders.includes(order._id));
    }

    // Filter by date range if specified
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      ordersToExport = ordersToExport.filter(order => {
        const orderDate = new Date(order.date || order.createdAt || "");
        // Check if order date is valid
        if (isNaN(orderDate.getTime())) {
          return false;
        }
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return ordersToExport;
  };

  const generateCSV = (ordersToExport: OrderData[]) => {
    const selectedFields = availableFields.filter(field => exportFields[field.key as keyof typeof exportFields]);
    const headers = selectedFields.map(field => field.label);
    
    const rows = ordersToExport.map(order => {
      return selectedFields.map(field => {
        switch (field.key) {
          case "orderNumber":
            return order.orderNumber || order._id.slice(-8);
          case "customerName":
            return order.shipping?.name || "N/A";
          case "customerEmail":
            return order.shipping?.email || "N/A";
          case "date":
            return order.date ? new Date(order.date).toLocaleDateString() : "N/A";
          case "status":
            return order.currentStatus || order.status || "pending";
          case "total":
            return `$${order.total || order.totalPrice || 0}`;
          case "items":
            return order.itemCount || order.quantity || 0;
          case "paymentMethod":
            return order.paymentMethod || "N/A";
          case "trackingNumber":
            return order.trackingNumber || "N/A";
          default:
            return "N/A";
        }
      });
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  };

  const generateJSON = (ordersToExport: OrderData[]) => {
    const selectedFields = availableFields.filter(field => exportFields[field.key as keyof typeof exportFields]);
    
    return ordersToExport.map(order => {
      const exportData: any = {};
      selectedFields.forEach(field => {
        switch (field.key) {
          case "orderNumber":
            exportData.orderNumber = order.orderNumber || order._id.slice(-8);
            break;
          case "customerName":
            exportData.customerName = order.shipping?.name || "N/A";
            break;
          case "customerEmail":
            exportData.customerEmail = order.shipping?.email || "N/A";
            break;
          case "date":
            exportData.date = order.date ? new Date(order.date).toLocaleDateString() : "N/A";
            break;
          case "status":
            exportData.status = order.currentStatus || order.status || "pending";
            break;
          case "total":
            exportData.total = order.total || order.totalPrice || 0;
            break;
          case "items":
            exportData.items = order.itemCount || order.quantity || 0;
            break;
          case "paymentMethod":
            exportData.paymentMethod = order.paymentMethod || "N/A";
            break;
          case "trackingNumber":
            exportData.trackingNumber = order.trackingNumber || "N/A";
            break;
        }
      });
      return exportData;
    });
  };

  const handleExport = () => {
    const ordersToExport = getOrdersToExport();
    
    console.log("Export debug:", {
      totalOrders: orders.length,
      selectedOrders: selectedOrders.length,
      ordersToExport: ordersToExport.length,
      dateRange,
      exportFields
    });
    
    if (ordersToExport.length === 0) {
      if (selectedOrders.length > 0) {
        toast.error("No selected orders match the current filters");
      } else if (dateRange.start && dateRange.end) {
        toast.error("No orders found in the selected date range");
      } else {
        toast.error("No orders available to export");
      }
      return;
    }

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === "csv") {
        content = generateCSV(ordersToExport);
        filename = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = "text/csv";
      } else {
        content = JSON.stringify(generateJSON(ordersToExport), null, 2);
        filename = `orders-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = "application/json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${ordersToExport.length} orders as ${exportFormat.toUpperCase()}`);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    }
  };

  const handleFieldToggle = (fieldKey: string) => {
    setExportFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey as keyof typeof prev]
    }));
  };

  const handleSelectAllFields = (checked: boolean) => {
    const newFields = { ...exportFields };
    availableFields.forEach(field => {
      newFields[field.key as keyof typeof newFields] = checked;
    });
    setExportFields(newFields);
  };

  const selectedFieldsCount = Object.values(exportFields).filter(Boolean).length;

  return (
    <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export {selectedOrders.length > 0 ? `(${selectedOrders.length})` : "All"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Orders
          </DialogTitle>
          <DialogDescription>
            Export {selectedOrders.length > 0 ? `${selectedOrders.length} selected` : "all"} orders to a file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <Table className="mr-2 h-4 w-4" />
                    CSV (Excel compatible)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-input rounded-md text-sm"
                placeholder="Start date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-input rounded-md text-sm"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Fields Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Fields to Export
              </label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedFieldsCount === availableFields.length}
                  onCheckedChange={handleSelectAllFields}
                />
                <span className="text-xs text-muted-foreground">Select All</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportFields[field.key as keyof typeof exportFields]}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                  />
                  <span className="text-sm">{field.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Will export <strong>{getOrdersToExport().length}</strong> orders with <strong>{selectedFieldsCount}</strong> fields as <strong>{exportFormat.toUpperCase()}</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsExportOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedFieldsCount === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Orders
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
