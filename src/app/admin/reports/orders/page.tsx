"use client";

import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, Download, Filter, ShoppingCart, Package, Users, Clock, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { ReportGenerationForm } from "@/components/reports/report-generation-form";
import { ReportsList } from "@/components/reports/reports-list";
import { ReportAnalyticsDashboard } from "@/components/reports/report-analytics-dashboard";
import { OrderAnalyticsDashboard } from "@/components/reports/order-analytics-dashboard";


import { ReportData, ReportType, ReportStatus } from "@/types/report.types";
import { 
  useGetReportsQuery, 
  useGetOrdersReportDataQuery
} from "@/lib/features/reports";
import { toast } from "sonner";

export default function OrdersReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });


  // RTK Query hooks for reports
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useGetReportsQuery({
    type: "orders",
    status: filters.status === "all" ? undefined : filters.status,
    search: filters.search || undefined,
  });

  const {
    data: ordersReportData,
    isLoading: ordersReportLoading,
    refetch: refetchOrdersReport,
  } = useGetOrdersReportDataQuery({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const reports = reportsData?.data || [];
  const ordersReportDataResult = ordersReportData?.data;

  // Check for generating reports and refresh periodically
  useEffect(() => {
    const hasGeneratingReports = reports.some(report => report.status === "generating");
    
    if (hasGeneratingReports) {
      const interval = setInterval(() => {
        refetchReports();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [reports, refetchReports]);

  // Show notification when reports are completed
  useEffect(() => {
    const completedReports = reports.filter(report => report.status === "completed");
    if (completedReports.length > 0) {
      // Check if this is a new completion (you might want to track this more sophisticatedly)
      completedReports.forEach(report => {
        toast.success(`Report "${report.title}" has been generated successfully!`);
      });
    }
  }, [reports]);



  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(false);
    setShowGenerateForm(false);
    refetchReports();
    toast.success("Report generation started successfully!");
  };

  const handleDeleteReport = (reportId: string) => {
    setSelectedReports(prev => prev.filter(id => id !== reportId));
    refetchReports();
  };

  const handleBulkDelete = (reportIds: string[]) => {
    setSelectedReports([]);
    refetchReports();
  };

  const handleRefresh = () => {
    refetchReports();
    refetchOrdersReport();
  };



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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              Orders Reports
            </h2>
            <p className="text-muted-foreground">
              Order status, fulfillment, and customer insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={reportsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button disabled={true} onClick={() => setShowGenerateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Orders Report
            </Button>
              </div>
            </div>
          </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ordersReportLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (ordersReportDataResult as any)?.summary?.totalOrders?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                All time
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
                {ordersReportLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (ordersReportDataResult as any)?.summary?.completedOrders?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
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
                {ordersReportLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (ordersReportDataResult as any)?.summary?.pendingOrders?.toLocaleString() || '0'
                )}
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
                {ordersReportLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (ordersReportDataResult as any)?.summary?.cancelledOrders?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Cancelled orders
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Analytics Dashboard */}
      <div className="px-4 lg:px-6">
        <OrderAnalyticsDashboard
          ordersData={ordersReportDataResult as any}
          isLoading={ordersReportLoading}
          onRefresh={handleRefresh}
        />
      </div>






      {/* Reports List */}
      <div className="px-4 lg:px-6">
        <ReportsList
          reports={reports}
          isLoading={reportsLoading}
          error={reportsError ? 'An error occurred while loading orders reports' : undefined}
          onRefresh={handleRefresh}
          onReportDelete={handleDeleteReport}
          onBulkDelete={handleBulkDelete}
          selectedReports={selectedReports}
          onSelectionChange={setSelectedReports}
        />
      </div>

      {/* Generate Report Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ReportGenerationForm
              onReportGenerated={handleGenerateReport}
              onCancel={() => setShowGenerateForm(false)}
              initialData={{ type: "orders" }}
            />
          </div>
        </div>
      )}

          </div>
        </div>
      </div>
    </div>
  );
}
