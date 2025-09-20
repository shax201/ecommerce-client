"use client";

import { useGetOrdersQuery, useGetOrderAnalyticsQuery } from "@/lib/features/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { 
  Package, 
  TrendingUp, 
  Truck, 
  BarChart3,
  ArrowRight,
  Users,
  DollarSign,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useGetOrdersQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetOrderAnalyticsQuery();
  
  const orders = ordersData?.data || [];
  const analytics = analyticsData?.data;

  // Debug: Log order structure to see what data we have
  console.log('Orders data structure:', orders.length > 0 ? {
    firstOrder: orders[0],
    clientIDType: typeof orders[0]?.clientID,
    clientIDValue: orders[0]?.clientID,
    shippingEmail: orders[0]?.clientID?.email
  } : 'No orders found');

  if (ordersLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading orders</p>
        </div>
      </div>
    );
  }

  // Calculate status counts
  const statusCounts = {
    pending: orders.filter(o => o.currentStatus?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'pending').length,
    processing: orders.filter(o => o.currentStatus?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'processing').length,
    shipped: orders.filter(o => o.currentStatus?.toLowerCase() === 'shipped' || o.status?.toLowerCase() === 'shipped').length,
    delivered: orders.filter(o => o.currentStatus?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'delivered').length,
    cancelled: orders.filter(o => o.currentStatus?.toLowerCase() === 'cancelled' || o.status?.toLowerCase() === 'cancelled').length,
  };

  return (
    <PermissionGate resource="orders" action="read" fallback={
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view orders</p>
        </div>
      </div>
    }>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
        </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.totalRevenue?.toLocaleString() || orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.averageOrderValue?.toFixed(2) || (orders.length > 0 ? (orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / orders.length).toFixed(2) : '0.00')}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const customerEmails = new Set<string>();
                const customerIds = new Set<string>();
                
                orders.forEach(order => {
                  // Try to get email from clientID if it's populated
                  if (typeof order.clientID === 'object' && order.clientID?.email) {
                    customerEmails.add(order.clientID.email);
                    customerIds.add(order.clientID._id);
                  }
                  // If clientID is just a string (ID), use it as unique identifier
                  else if (typeof order.clientID === 'string') {
                    customerIds.add(order.clientID);
                  }
                  // Fallback to clientID email
                  else if (order.clientID?.email) {
                    customerEmails.add(order.clientID.email);
                  }
                });
                
                // Return the count of unique customers (either by email or ID)
                return Math.max(customerEmails.size, customerIds.size);
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique customers
            </p>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Debug: {(() => {
                  const customerEmails = new Set<string>();
                  const customerIds = new Set<string>();
                  
                  orders.forEach(order => {
                    if (typeof order.clientID === 'object' && order.clientID?.email) {
                      customerEmails.add(order.clientID.email);
                      customerIds.add(order.clientID._id);
                    } else if (typeof order.clientID === 'string') {
                      customerIds.add(order.clientID);
                    } else if (order.clientID?.email) {
                      customerEmails.add(order.clientID.email);
                    }
                  });
                  
                  return `Emails: ${customerEmails.size}, IDs: ${customerIds.size}`;
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Order Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.processing}</div>
              <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.shipped}</div>
              <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.delivered}</div>
              <Badge className="bg-green-100 text-green-800">Delivered</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
              <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/orders/all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  All Orders
                </div>
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                View and manage all orders in your store
              </p>
              <div className="text-2xl font-bold">{orders.length} orders</div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/orders/track">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Track Orders
                </div>
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Monitor order status and tracking information
              </p>
              <div className="text-2xl font-bold">
                {statusCounts.shipped + statusCounts.processing} in transit
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/orders/analytics">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analytics
                </div>
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                View detailed analytics and insights
              </p>
              <div className="text-2xl font-bold">
                ${analytics?.totalRevenue?.toLocaleString() || '0'} revenue
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
      </div>
    </PermissionGate>
  );
}
