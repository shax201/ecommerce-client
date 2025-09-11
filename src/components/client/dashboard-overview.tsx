"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Gift,
  CreditCard,
  Eye,
  Loader2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface DashboardData {
  user: {
    name: string;
    email: string;
    avatar: string;
    joinDate: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    membershipTier: string;
  };
  metrics: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    canceledOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    loyaltyPoints: number;
  };
  spendingTrends: Array<{ month: string; amount: number }>;
  categorySpending: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  orderAnalytics: Array<{
    month: string;
    pending: number;
    completed: number;
    canceled: number;
  }>;
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/client/dashboard/overview");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading dashboard: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const categoryChartData = data.categorySpending.map((item, index) => ({
    name: item.category,
    value: item.percentage,
    amount: item.amount,
    color: [
      "hsl(262, 83%, 58%)", // Vibrant purple
      "hsl(346, 77%, 49%)", // Vibrant pink
      "hsl(32, 95%, 44%)", // Vibrant orange
      "hsl(173, 58%, 39%)", // Vibrant teal
      "hsl(220, 70%, 50%)", // Vibrant blue
    ][index % 5],
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={data.user.avatar || "/placeholder.svg"}
                  alt={data.user.name}
                />
                <AvatarFallback className="text-lg">
                  {data.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {data.user.name.split(" ")[0]}!
                </h2>
                <p className="text-gray-600">
                  Here's what's happening with your account today.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-semibold">
                {new Date(data.user.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {data.metrics.totalOrders}
                </p>
                <p className="text-xs text-blue-600 mt-1">All time orders</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Spent
                </p>
                <p className="text-3xl font-bold text-green-900">
                  ${data.metrics.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-1">Lifetime value</p>
              </div>
              <div className="p-3 bg-green-600 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Avg Order Value
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  ${data.metrics.averageOrderValue.toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Per order</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Loyalty Points
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {data.metrics.loyaltyPoints}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {data.user.membershipTier} member
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Spending Trends
            </CardTitle>
            <CardDescription>
              Monthly spending pattern over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer
              config={{
                amount: { label: "Spending ($)", color: "hsl(220, 70%, 50%)" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.spendingTrends}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAmount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-amount)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`$${value}`, "Spending"]}
                      />
                    }
                    cursor={{
                      stroke: "rgba(59, 130, 246, 0.3)",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    fill="url(#colorAmount)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Spending by Category
            </CardTitle>
            <CardDescription>
              Distribution of your purchases across categories
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer
              config={{
                electronics: {
                  label: "Electronics",
                  color: "hsl(262, 83%, 58%)",
                },
                clothing: { label: "Clothing", color: "hsl(346, 77%, 49%)" },
                books: { label: "Books", color: "hsl(32, 95%, 44%)" },
                home: { label: "Home", color: "hsl(173, 58%, 39%)" },
                sports: { label: "Sports", color: "hsl(220, 70%, 50%)" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => [
                          `${value}% ($${props.payload.amount})`,
                          props.payload.name,
                        ]}
                      />
                    }
                    cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {categoryChartData.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    ${category.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Order Status Analytics
          </CardTitle>
          <CardDescription>
            Monthly breakdown of order completion rates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer
            config={{
              completed: { label: "Completed", color: "hsl(142, 76%, 36%)" },
              pending: { label: "Pending", color: "hsl(48, 96%, 53%)" },
              canceled: { label: "Canceled", color: "hsl(0, 84%, 60%)" },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.orderAnalytics}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-pending)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-pending)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorCanceled"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-canceled)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-canceled)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value} orders`,
                        typeof name === "string"
                          ? name.charAt(0).toUpperCase() + name.slice(1)
                          : String(name),
                      ]}
                    />
                  }
                  cursor={{ stroke: "rgba(59, 130, 246, 0.3)", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="var(--color-completed)"
                  fill="url(#colorCompleted)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="var(--color-pending)"
                  fill="url(#colorPending)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="canceled"
                  stackId="1"
                  stroke="var(--color-canceled)"
                  fill="url(#colorCanceled)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Enhanced Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Enhanced Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest account activity and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent activity data will be fetched from API */}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Loyalty */}
        <div className="space-y-6">
          {/* Enhanced Loyalty Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Loyalty Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Points</span>
                  <span className="font-medium">
                    {data.metrics.loyaltyPoints}
                  </span>
                </div>
                <Progress
                  value={(data.metrics.loyaltyPoints / 1500) * 100}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>1500 (Next Reward)</span>
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  {1500 - data.metrics.loyaltyPoints} points until your next
                  reward!
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Earn 50 points per $10 spent
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start bg-transparent"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Track Orders
              </Button>
              <Button
                className="w-full justify-start bg-transparent"
                variant="outline"
              >
                <Star className="h-4 w-4 mr-2" />
                Write Reviews
              </Button>
              <Button
                className="w-full justify-start bg-transparent"
                variant="outline"
              >
                <Gift className="h-4 w-4 mr-2" />
                View Rewards
              </Button>
              <Button
                className="w-full justify-start bg-transparent"
                variant="outline"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Recent Orders Summary */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest order activity with detailed information
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4"></div>
        </CardContent>
      </Card> */}
    </div>
  );
}
