"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Package, Truck, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface TrackingData {
  orderStatusDistribution: Array<{ status: string; count: number; percentage: number }>
  deliveryPerformance: Array<{ timeframe: string; orders: number }>
  monthlyTrends: Array<{ month: string; orders: number; avgDeliveryTime: number }>
  activeOrders: Array<{
    id: string
    status: string
    estimatedDelivery: string
    progress: number
    trackingSteps: Array<{ step: string; completed: boolean; date: string | null }>
  }>
}

export function OrderTrackingCharts() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/client/orders/tracking")
        if (!response.ok) {
          throw new Error("Failed to fetch tracking data")
        }
        const trackingData = await response.json()
        setData(trackingData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTrackingData()
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading tracking data: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!data) return null

  const statusChartData = data.orderStatusDistribution.map((item, index) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
    color: [
      "hsl(48, 96%, 53%)", // Vibrant yellow - Pending
      "hsl(220, 70%, 50%)", // Vibrant blue - Processing
      "hsl(262, 83%, 58%)", // Vibrant purple - Shipped
      "hsl(142, 76%, 36%)", // Vibrant green - Delivered
      "hsl(0, 84%, 60%)", // Vibrant red - Canceled
    ][index % 5],
  }))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "canceled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Order Tracking Analytics
          </h2>
          <p className="text-slate-600 font-medium">Visual insights into your order status and delivery patterns</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-48 h-11 bg-white/80 border-slate-200/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Order Status Distribution
            </CardTitle>
            <CardDescription className="text-slate-600">Current status breakdown of all your orders</CardDescription>
          </CardHeader>
          <CardContent className="pb-6 p-4">
            <ChartContainer
              config={{
                pending: { label: "Pending", color: "hsl(48, 96%, 53%)" },
                processing: { label: "Processing", color: "hsl(220, 70%, 50%)" },
                shipped: { label: "Shipped", color: "hsl(262, 83%, 58%)" },
                delivered: { label: "Delivered", color: "hsl(142, 76%, 36%)" },
                canceled: { label: "Canceled", color: "hsl(0, 84%, 60%)" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => [
                          `${value} orders (${props.payload.percentage}%)`,
                          props.payload.name,
                        ]}
                      />
                    }
                    cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-5 gap-3 mt-4">
              {statusChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-slate-700 block truncate">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.value} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Delivery Performance
            </CardTitle>
            <CardDescription className="text-slate-600">Order delivery timeframes</CardDescription>
          </CardHeader>
          <CardContent className="pb-6 p-4">
            <ChartContainer
              config={{
                orders: { label: "Orders", color: "hsl(220, 70%, 50%)" },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.deliveryPerformance} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="timeframe" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => [`${value} orders`, "Orders"]} />}
                    cursor={{ stroke: "rgba(59, 130, 246, 0.3)", strokeWidth: 2 }}
                    animationDuration={200}
                  />
                  <Bar dataKey="orders" fill="var(--color-orders)" name="Orders" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Monthly Order Trends
            </CardTitle>
            <CardDescription className="text-slate-600">
              Order volume and delivery performance over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 p-4">
            <ChartContainer
              config={{
                orders: { label: "Total Orders", color: "hsl(220, 70%, 50%)" },
                avgDeliveryTime: { label: "Avg Delivery Time", color: "hsl(32, 95%, 44%)" },
              }}
              className="h-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(32, 95%, 44%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(32, 95%, 44%)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === "avgDeliveryTime" ? `${value} days` : `${value} orders`,
                          name === "avgDeliveryTime" ? "Avg Delivery Time" : "Total Orders",
                        ]}
                      />
                    }
                    cursor={{ stroke: "rgba(59, 130, 246, 0.3)", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    fill="url(#ordersGradient)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-orders)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgDeliveryTime"
                    stroke="var(--color-avgDeliveryTime)"
                    fill="url(#deliveryGradient)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-avgDeliveryTime)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Active Order Tracking
          </CardTitle>
          <CardDescription className="text-slate-600">Real-time status of your current orders</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-6">
            {data.activeOrders.map((order) => (
              <div
                key={order.id}
                className="border border-slate-200/60 rounded-xl p-6 space-y-6 bg-white/40 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                        {getStatusIcon(order.status)}
                      </div>
                      <span className="font-semibold text-slate-900">{order.id}</span>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} font-medium`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white/80 border-slate-200/60 hover:bg-white">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                  <span className="text-slate-600">
                    Est. Delivery: <span className="font-medium">{order.estimatedDelivery}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Progress</span>
                    <span className="font-semibold text-slate-900">{order.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {order.trackingSteps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          step.completed
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 font-medium text-slate-700 leading-tight">{step.step}</span>
                      {step.date && <span className="text-xs text-slate-500 mt-1 font-medium">{step.date}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
