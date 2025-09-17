"use client";

import React, { useState } from "react";
import { Plus, RefreshCw, FileText, TrendingUp, ShoppingCart, Package, Users, Archive, Tag, BarChart3, DollarSign, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ReportData, ReportType, ReportStatus } from "@/types/report.types";
import { useGetReportsQuery, useGetSalesReportDataQuery } from "@/lib/features/reports";

// ===== COMPONENT =====

export default function ReportsOverviewPage() {
  const {
    data: reportsData,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useGetReportsQuery({});

  const {
    data: salesData,
    isLoading: salesLoading,
  } = useGetSalesReportDataQuery({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const reports = reportsData?.data || [];
  const salesReportData = salesData?.data;

  const getStatusCounts = () => {
    const counts = {
      completed: 0,
      generating: 0,
      failed: 0,
      pending: 0,
    };

    reports.forEach(report => {
      if (counts.hasOwnProperty(report.status)) {
        counts[report.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const reportTypes = [
    {
      id: "sales",
      name: "Sales Reports",
      href: "/admin/reports/sales",
      icon: TrendingUp,
      description: "Revenue, orders, and sales performance metrics",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "orders",
      name: "Orders Reports",
      href: "/admin/reports/orders",
      icon: ShoppingCart,
      description: "Order status, fulfillment, and customer insights",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "products",
      name: "Products Reports",
      href: "/admin/reports/products",
      icon: Package,
      description: "Product performance, inventory, and sales data",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "customers",
      name: "Customers Reports",
      href: "/admin/reports/customers",
      icon: Users,
      description: "Customer behavior, segments, and lifetime value",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "inventory",
      name: "Inventory Reports",
      href: "/admin/reports/inventory",
      icon: Archive,
      description: "Stock levels, movements, and low stock alerts",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      id: "coupons",
      name: "Coupons Reports",
      href: "/admin/reports/coupons",
      icon: Tag,
      description: "Coupon usage, performance, and discount analytics",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      id: "analytics",
      name: "Analytics Reports",
      href: "/admin/reports/analytics",
      icon: BarChart3,
      description: "Website traffic, conversion rates, and user behavior",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: "financial",
      name: "Financial Reports",
      href: "/admin/reports/financial",
      icon: DollarSign,
      description: "Revenue, costs, profit margins, and financial metrics",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                  <p className="text-muted-foreground">
                    Generate reports and manage your data
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchReports()}
                    disabled={reportsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button asChild>
                    <Link href="/admin/reports/sales">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Report
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reports.length}</div>
                    <p className="text-xs text-muted-foreground">
                      All time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <Badge variant="default">{statusCounts.completed}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                    <p className="text-xs text-muted-foreground">
                      Ready for download
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Generating</CardTitle>
                    <Badge variant="secondary">{statusCounts.generating}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{statusCounts.generating}</div>
                    <p className="text-xs text-muted-foreground">
                      In progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                    <Badge variant="destructive">{statusCounts.failed}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{statusCounts.failed}</div>
                    <p className="text-xs text-muted-foreground">
                      Need attention
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Report Types Grid */}
            <div className="px-4 lg:px-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Report Types</h2>
                <p className="text-muted-foreground">
                  Choose a report type to generate detailed analytics
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reportTypes.map((reportType) => {
                  const Icon = reportType.icon;
                  return (
                    <Card key={reportType.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className={`w-12 h-12 rounded-lg ${reportType.bgColor} flex items-center justify-center mb-3`}>
                          <Icon className={`h-6 w-6 ${reportType.color}`} />
                        </div>
                        <CardTitle className="text-lg">{reportType.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {reportType.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                          <Link href={reportType.href} className="flex items-center justify-center">
                            View Reports
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="px-4 lg:px-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Recent Reports</h2>
                <p className="text-muted-foreground">
                  Your latest generated reports
                </p>
              </div>
              
              {reportsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.slice(0, 6).map((report) => (
                    <Card key={report.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {report.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                          <span className="capitalize">{report.type}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Generate your first report to get started
                    </p>
                    <Button asChild>
                      <Link href="/admin/reports/sales">
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Report
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
