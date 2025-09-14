"use client";

import { useGetOrderAnalyticsQuery } from "@/lib/features/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  Package,
  Calendar,
  BarChart3
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function OrderAnalytics() {
  const { data, error, isLoading } = useGetOrderAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">Error loading analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analytics = data?.data;

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
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
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
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
              {Object.values(analytics.ordersByStatus).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              With orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Orders by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <Badge className={statusColors[status as keyof typeof statusColors]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Orders */}
      {analytics.ordersByMonth && analytics.ordersByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Monthly Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.ordersByMonth.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{month.month}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      {month.orders} orders
                    </div>
                    <div className="text-sm font-medium">
                      ${month.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {analytics.topProducts && analytics.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{product.productName}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      {product.quantitySold} sold
                    </div>
                    <div className="text-sm font-medium">
                      ${product.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
