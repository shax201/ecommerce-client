"use client";

import React from "react";
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { OrdersReportData } from "@/types/report.types";

// ===== COMPONENT =====

interface OrderAnalyticsDashboardProps {
  ordersData?: OrdersReportData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function OrderAnalyticsDashboard({
  ordersData,
  isLoading = false,
  onRefresh
}: OrderAnalyticsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'shipped':
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </CardTitle>
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!ordersData) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Order Data Available</h3>
        <p className="text-muted-foreground mb-4">
          No order data found for the selected period.
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            Refresh Data
          </Button>
        )}
      </div>
    );
  }

  const completionRate = ordersData.summary.totalOrders > 0 
    ? (ordersData.summary.completedOrders / ordersData.summary.totalOrders) * 100 
    : 0;

  const cancellationRate = ordersData.summary.totalOrders > 0 
    ? (ordersData.summary.cancelledOrders / ordersData.summary.totalOrders) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(ordersData.summary.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(ordersData.summary.completedOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatNumber(ordersData.summary.pendingOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(ordersData.summary.cancelledOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cancellationRate.toFixed(1)}% cancellation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(ordersData.summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatNumber(ordersData.summary.totalOrders)} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(ordersData.summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="status" className="space-y-4">
        {/* <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Order Status</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
        </TabsList> */}

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Orders by Status
              </CardTitle>
              <CardDescription>
                Distribution of orders by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.ordersByStatus.map((status) => (
                  <div key={status.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <span className="text-sm font-medium capitalize">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatNumber(status.count)}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({status.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={status.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(status.value)} total value
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
              <CardDescription>
                Order volume and value over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.orderTimeline.slice(-10).map((timeline) => (
                  <div key={timeline.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{timeline.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(timeline.orders)} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(timeline.value)}</p>
                      <p className="text-xs text-muted-foreground">
                        Revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Customers
              </CardTitle>
              <CardDescription>
                Customers with highest order values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.topCustomers.slice(0, 10).map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{customer.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(customer.orderCount)} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(customer.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Last order: {formatDate(customer.lastOrderDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Order volume and revenue trends by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.ordersByMonth.slice(-12).map((month) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(month.orders)} orders
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(month.value)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((month.orders / Math.max(...ordersData.ordersByMonth.map(m => m.orders))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      {month.growth !== 0 && (
                        <Badge variant={month.growth > 0 ? "default" : "destructive"}>
                          {month.growth > 0 ? "+" : ""}{month.growth.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
