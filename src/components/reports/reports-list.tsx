"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { ReportData, ReportType, ReportStatus } from "@/types/report.types";
import { downloadReportWithCacheInvalidation, deleteReportWithCacheInvalidation } from "@/actions/reports";

// ===== COMPONENT =====

interface ReportsListProps {
  reports: ReportData[];
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onReportSelect?: (report: ReportData) => void;
  onReportDelete?: (reportId: string) => void;
  onBulkDelete?: (reportIds: string[]) => void;
  selectedReports?: string[];
  onSelectionChange?: (reportIds: string[]) => void;
}

export function ReportsList({
  reports,
  isLoading = false,
  error,
  onRefresh,
  onReportSelect,
  onReportDelete,
  onBulkDelete,
  selectedReports = [],
  onSelectionChange,
}: ReportsListProps) {
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set());
  const [deletingReports, setDeletingReports] = useState<Set<string>>(new Set());

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedReports, reportId]);
    } else {
      onSelectionChange?.(selectedReports.filter(id => id !== reportId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(reports.map(report => report.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleDownload = async (report: ReportData) => {
    if (!report.fileUrl) return;

    setDownloadingReports(prev => new Set(prev).add(report.id));
    
    try {
      const result = await downloadReportWithCacheInvalidation(report.id);
      
      if (result.success && result.data) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = `${report.title}.${report.type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (report: ReportData) => {
    setDeletingReports(prev => new Set(prev).add(report.id));
    
    try {
      const result = await deleteReportWithCacheInvalidation(report.id);
      
      if (result.success) {
        onReportDelete?.(report.id);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    } finally {
      setDeletingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "generating":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      generating: "secondary",
      pending: "outline",
      expired: "secondary",
    } as const;

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: ReportType) => {
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reports found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by generating your first report
          </p>
          <Button onClick={onRefresh}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedReports.length} report(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkDelete?.(selectedReports)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectionChange?.([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Manage and download your generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{report.title}</div>
                      {report.description && (
                        <div className="text-sm text-muted-foreground">
                          {report.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <span className="capitalize">{report.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      {getStatusBadge(report.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {format(new Date(report.generatedAt), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(report.generatedAt), "HH:mm")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatFileSize(report.fileSize)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onReportSelect?.(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {report.status === "completed" && report.fileUrl && (
                          <DropdownMenuItem
                            onClick={() => handleDownload(report)}
                            disabled={downloadingReports.has(report.id)}
                          >
                            {downloadingReports.has(report.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="mr-2 h-4 w-4" />
                            )}
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(report)}
                          disabled={deletingReports.has(report.id)}
                          className="text-red-600"
                        >
                          {deletingReports.has(report.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
