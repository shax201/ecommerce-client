"use client";

import React from "react";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package, Tag, BarChart3, XCircle, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SalesReportData, OrdersReportData, ProductsReportData, CustomersReportData } from "@/types/report.types";

// ===== COMPONENT =====

interface ReportAnalyticsDashboardProps {
  salesData?: SalesReportData;
  ordersData?: OrdersReportData;
  productsData?: ProductsReportData;
  customersData?: CustomersReportData;
  isLoading?: boolean;
}

export function ReportAnalyticsDashboard({
  salesData,
  ordersData,
  productsData,
  customersData,
  isLoading = false,
}: ReportAnalyticsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(salesData.summary.totalOrders)} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">
                Per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.totalDiscount)}</div>
              <p className="text-xs text-muted-foreground">
                Discounts applied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.netRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                After discounts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Overview */}
      {ordersData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(ordersData.summary.totalOrders)}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(ordersData.summary.completedOrders)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((ordersData.summary.completedOrders / ordersData.summary.totalOrders) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(ordersData.summary.pendingOrders)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(ordersData.summary.cancelledOrders)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((ordersData.summary.cancelledOrders / ordersData.summary.totalOrders) * 100)}% cancellation rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Overview */}
      {productsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(productsData.summary.totalProducts)}</div>
              <p className="text-xs text-muted-foreground">
                In catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(productsData.summary.activeProducts)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((productsData.summary.activeProducts / productsData.summary.totalProducts) * 100)}% active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(productsData.summary.outOfStock)}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(productsData.summary.lowStock)}</div>
              <p className="text-xs text-muted-foreground">
                Below threshold
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Overview */}
      {customersData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(customersData.summary.totalCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(customersData.summary.newCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                This period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(customersData.summary.activeCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                Made purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(customersData.summary.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                Customer spending
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {salesData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best performing products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(salesData?.topProducts || []).slice(0, 5).map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(product.quantitySold)} sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                          <p className="text-xs text-muted-foreground">
                            #{index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Revenue distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.salesByCategory.map((category) => (
                      <div key={category.categoryId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.categoryName}</span>
                          <span className="text-sm text-muted-foreground">
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(category.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {ordersData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                  <CardDescription>Distribution of orders by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ordersData.ordersByStatus.map((status) => (
                      <div key={status.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{status.status}</span>
                          <span className="text-sm text-muted-foreground">
                            {status.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={status.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(status.count)} orders ({formatCurrency(status.value)})
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Customers with highest order values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(ordersData?.topCustomers || []).slice(0, 5).map((customer, index) => (
                      <div key={customer.customerId} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{customer.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(customer.orderCount)} orders
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(customer.totalValue)}</p>
                          <p className="text-xs text-muted-foreground">
                            #{index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {productsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Products</CardTitle>
                  <CardDescription>Products that need restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(productsData?.lowStockProducts || []).slice(0, 5).map((product) => (
                      <div key={product.productId} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={product.currentStock === 0 ? "destructive" : "secondary"}>
                            {formatNumber(product.currentStock)} / {formatNumber(product.minimumStock)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Products with highest sales volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(productsData?.topSellingProducts || []).slice(0, 5).map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(product.quantitySold)} sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                          <p className="text-xs text-muted-foreground">
                            #{index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {customersData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>Customer distribution by segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customersData.customerSegments.map((segment) => (
                      <div key={segment.segment} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{segment.segment}</span>
                          <span className="text-sm text-muted-foreground">
                            {segment.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={segment.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(segment.count)} customers (avg: {formatCurrency(segment.averageValue)})
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Customers with highest lifetime value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(customersData?.topCustomers || []).slice(0, 5).map((customer, index) => (
                      <div key={customer.customerId} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{customer.customerName}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(customer.customerLifetimeValue)}</p>
                          <p className="text-xs text-muted-foreground">
                            #{index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
