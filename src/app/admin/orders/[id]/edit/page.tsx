"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetOrderByIdQuery, useUpdateOrderMutation } from "@/lib/features/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Save,
  Package, 
  User, 
  MapPin, 
  CreditCard,
  Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [formData, setFormData] = useState({
    status: "",
    trackingNumber: "",
    notes: "",
    estimatedDeliveryDate: "",
    paymentStatus: false,
  });

  const { data, error, isLoading } = useGetOrderByIdQuery(orderId);
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  const order = data?.data;

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.currentStatus || order.status || "pending",
        trackingNumber: order.trackingNumber || "",
        notes: order.notes || "",
        estimatedDeliveryDate: order.estimatedDeliveryDate 
          ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0]
          : "",
        paymentStatus: order.paymentStatus || false,
      });
    }
  }, [order]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;

    try {
      await updateOrder({
        id: order._id,
        data: {
          status: formData.status,
          trackingNumber: formData.trackingNumber,
          notes: formData.notes,
          estimatedDeliveryDate: formData.estimatedDeliveryDate 
            ? new Date(formData.estimatedDeliveryDate).toISOString()
            : undefined,
        }
      }).unwrap();

      toast.success("Order updated successfully");
      router.push(`/orders/${order._id}`);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order");
    }
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
          <Link href={`/admin/orders/${order._id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Order
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Edit Order #{order.orderNumber || order._id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Update order details and status
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange("status", value)}
                >
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
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                <Input
                  id="estimatedDeliveryDate"
                  type="date"
                  value={formData.estimatedDeliveryDate}
                  onChange={(e) => handleInputChange("estimatedDeliveryDate", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  value={order.paymentMethod || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select 
                  value={formData.paymentStatus ? "paid" : "pending"} 
                  onValueChange={(value) => handleInputChange("paymentStatus", value === "paid")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  value={`$${order.totalPrice || 0}`}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.clientID ? (
                <>
                  <div>
                    <Label>Customer Name</Label>
                    <Input
                      value={order.clientID.name}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={order.clientID.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value=""
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No customer information available</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <Input
                    value=""
                    disabled
                    className="bg-muted"
                    placeholder="Address not available"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value=""
                      disabled
                      className="bg-muted"
                      placeholder="City not available"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value=""
                      disabled
                      className="bg-muted"
                      placeholder="State not available"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ZIP Code</Label>
                    <Input
                      value=""
                      disabled
                      className="bg-muted"
                      placeholder="ZIP not available"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value=""
                      disabled
                      className="bg-muted"
                      placeholder="Country not available"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any notes about this order..."
                className="mt-1"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2">
          <Link href={`/orders/${order._id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isUpdating}>
            <Save className="mr-2 h-4 w-4" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
