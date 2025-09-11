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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Eye, CreditCard, Loader2 } from "lucide-react";
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
import { format } from "date-fns";

interface HistoryData {
  spendingHistory: Array<{ month: string; amount: number }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    orders: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    orderId: string;
    date: string;
    amount: number;
    status: string;
    paymentMethod: string;
    description: string;
  }>;
  summary: {
    totalTransactions: number;
    totalAmount: number;
    averageOrderValue: number;
    mostPopularCategory: string;
    favoritePaymentMethod: string;
  };
}

export function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("6months");
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user-token="))
          ?.split("=")[1];

        console.log("token", token);
        const res = await fetch("http://localhost:5000/api/v1/order/my", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setOrders(data.data.orders);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [timeframe, categoryFilter]);

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
        <p className="text-red-600">Error loading order history: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const categoryChartData = data.categoryBreakdown.map((item, index) => ({
    category: item.category,
    amount: item.amount,
    orders: item.orders,
    percentage: item.percentage,
    color: [
      "hsl(220, 70%, 50%)", // Vibrant blue
      "hsl(262, 83%, 58%)", // Vibrant purple
      "hsl(142, 76%, 36%)", // Vibrant green
      "hsl(32, 95%, 44%)", // Vibrant orange
      "hsl(0, 84%, 60%)", // Vibrant red
    ][index % 5],
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = data.recentTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Order History
          </h2>
          <p className="text-slate-600 font-medium">
            Complete transaction history and spending analytics
          </p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-full sm:w-48 h-11 bg-white/80 border-slate-200/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {data.summary.totalTransactions}
            </div>
            <p className="text-xs text-blue-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ${data.summary.totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ${data.summary.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-purple-600 mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Monthly Spending Trend
            </CardTitle>
            <CardDescription>Your spending pattern over time</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer
              config={{
                amount: { label: "Amount ($)", color: "hsl(220, 70%, 50%)" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.spendingHistory}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="spendingGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(220, 70%, 50%)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(220, 70%, 50%)"
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
                    fill="url(#spendingGradient)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Spending by Category
            </CardTitle>
            <CardDescription>
              Breakdown of purchases by product category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer
              config={{
                Electronics: {
                  label: "Electronics",
                  color: "hsl(220, 70%, 50%)",
                },
                Clothing: { label: "Clothing", color: "hsl(262, 83%, 58%)" },
                Books: { label: "Books", color: "hsl(142, 76%, 36%)" },
                Home: { label: "Home", color: "hsl(32, 95%, 44%)" },
                Sports: { label: "Sports", color: "hsl(0, 84%, 60%)" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => [
                          `$${value} (${props.payload.orders} orders)`,
                          props.payload.category,
                        ]}
                      />
                    }
                    cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {categoryChartData.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-slate-700 block truncate">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      ${item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Search and filter your complete transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 border-slate-200/60"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/80 border-slate-200/60">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="bg-white/80 border-slate-200/60 hover:bg-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border border-slate-200/60 rounded-lg p-4 hover:bg-gray-50/50 transition-colors bg-white/40 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Transaction #{transaction.id}
                        </span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </span>
                        <span>Order #{transaction.orderId}</span>
                        <span>{transaction.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-white/80 border-slate-200/60 hover:bg-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
