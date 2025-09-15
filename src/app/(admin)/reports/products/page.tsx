"use client";

import React, { useState } from "react";
import { Plus, RefreshCw, Filter, Package, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ReportGenerationForm } from "@/components/reports/report-generation-form";
import { ReportsList } from "@/components/reports/reports-list";
import { ReportAnalyticsDashboard } from "@/components/reports/report-analytics-dashboard";

import { ReportData, ReportType, ReportStatus } from "@/types/report.types";
import { useGetReportsQuery, useGetProductsReportDataQuery } from "@/lib/features/reports";

export default function ProductsReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // RTK Query hooks
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useGetReportsQuery({
    type: "products",
    status: filters.status === "all" ? undefined : filters.status,
    search: filters.search || undefined,
  });

  const {
    data: productsData,
    isLoading: productsLoading,
  } = useGetProductsReportDataQuery({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const reports = reportsData?.data || [];
  const productsReportData = productsData?.data;

  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(false);
    setShowGenerateForm(false);
    refetchReports();
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
  };

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
              <Package className="h-6 w-6 text-purple-600" />
              Products Reports
            </h2>
            <p className="text-muted-foreground">
              Product performance, inventory, and sales data
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
            <Button onClick={() => setShowGenerateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Products Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  productsReportData?.summary?.totalProducts?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                In catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {productsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  productsReportData?.summary?.activeProducts?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for sale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {productsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  productsReportData?.summary?.outOfStock?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {productsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  productsReportData?.summary?.lowStock?.toLocaleString() || '0'
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Below threshold
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="px-4 lg:px-6">
        <ReportAnalyticsDashboard
          productsData={productsReportData}
          isLoading={productsLoading}
        />
      </div>

      {/* Filters */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search products reports..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: "all", search: "" })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="px-4 lg:px-6">
        <ReportsList
          reports={reports}
          isLoading={reportsLoading}
          error={reportsError ? 'An error occurred while loading products reports' : undefined}
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
              initialData={{ type: "products" }}
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
