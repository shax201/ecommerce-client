"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Download, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { ReportType, ReportFormat, ReportFilters, ReportPeriod } from "@/types/report.types";
import { getReportTypeOptions, getReportFormatOptions, getReportPeriods } from "@/actions/reports";
import { generateReportWithCacheInvalidation } from "@/actions/reports";

// ===== FORM SCHEMA =====

const reportGenerationSchema = z.object({
  type: z.enum(["sales", "orders", "products", "customers", "inventory", "coupons", "analytics", "financial", "custom"]),
  format: z.enum(["pdf", "excel", "csv", "json"]),
  title: z.string().min(1, "Report title is required"),
  description: z.string().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  status: z.string().optional(),
  category: z.string().optional(),
  product: z.string().optional(),
  customer: z.string().optional(),
  paymentMethod: z.string().optional(),
  orderStatus: z.string().optional(),
  couponCode: z.string().optional(),
  includeCharts: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  emailNotification: z.boolean().default(false),
  emailAddress: z.string().email().optional(),
});

type ReportGenerationFormData = z.infer<typeof reportGenerationSchema>;

// ===== COMPONENT =====

interface ReportGenerationFormProps {
  onReportGenerated?: (reportId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<ReportGenerationFormData>;
}

export function ReportGenerationForm({
  onReportGenerated,
  onCancel,
  initialData,
}: ReportGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30days");

  const [reportTypeOptions, setReportTypeOptions] = useState<Array<{ value: ReportType; label: string; description: string }>>([]);
  const [reportFormatOptions, setReportFormatOptions] = useState<Array<{ value: ReportFormat; label: string; description: string }>>([]);
  const [reportPeriods, setReportPeriods] = useState<ReportPeriod[]>([]);

  const form = useForm({
    resolver: zodResolver(reportGenerationSchema),
    defaultValues: {
      type: (initialData?.type as ReportType) || "sales",
      format: (initialData?.format as ReportFormat) || "pdf",
      title: initialData?.title || "",
      description: initialData?.description || "",
      dateRange: initialData?.dateRange || {
        start: "",
        end: "",
      },
      status: initialData?.status || "",
      category: initialData?.category || "",
      product: initialData?.product || "",
      customer: initialData?.customer || "",
      paymentMethod: initialData?.paymentMethod || "",
      orderStatus: initialData?.orderStatus || "",
      couponCode: initialData?.couponCode || "",
      includeCharts: initialData?.includeCharts ?? true,
      includeDetails: initialData?.includeDetails ?? true,
      emailNotification: initialData?.emailNotification ?? false,
      emailAddress: initialData?.emailAddress || "",
    },
  }) as any;

  // Load options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      const [typeOptions, formatOptions, periods] = await Promise.all([
        getReportTypeOptions(),
        getReportFormatOptions(),
        getReportPeriods(),
      ]);
      setReportTypeOptions(typeOptions);
      setReportFormatOptions(formatOptions);
      setReportPeriods(periods);
      
      // Set default date range
      const defaultPeriod = periods.find(p => p.value === "last30days");
      if (defaultPeriod) {
        form.setValue("dateRange.start", defaultPeriod.startDate);
        form.setValue("dateRange.end", defaultPeriod.endDate);
      }
    };
    loadOptions();
  }, [form]);

  const watchedType = form.watch("type");
  const watchedEmailNotification = form.watch("emailNotification");

  const handlePeriodChange = (periodValue: string) => {
    setSelectedPeriod(periodValue);
    const period = reportPeriods.find(p => p.value === periodValue);
    if (period) {
      form.setValue("dateRange.start", period.startDate);
      form.setValue("dateRange.end", period.endDate);
    }
  };

  const onSubmit = async (data: ReportGenerationFormData) => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const reportData = {
        type: data.type,
        format: data.format,
        filters: {
          dateRange: data.dateRange,
          status: data.status,
          category: data.category,
          product: data.product,
          customer: data.customer,
          paymentMethod: data.paymentMethod,
          orderStatus: data.orderStatus,
          couponCode: data.couponCode,
        },
        period: reportPeriods.find(p => p.value === selectedPeriod) || reportPeriods[0],
        includeCharts: data.includeCharts,
        includeDetails: data.includeDetails,
        emailNotification: data.emailNotification,
        emailAddress: data.emailAddress,
      };

      const result = await generateReportWithCacheInvalidation(reportData);

      if (result.success && result.data) {
        onReportGenerated?.(result.data.reportId);
      } else {
        setGenerationError(result.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setGenerationError("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate New Report
        </CardTitle>
        <CardDescription>
          Create a comprehensive report with custom filters and export options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Report Type and Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Export Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportFormatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter report title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <FormLabel>Date Range</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Select</label>
                  <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportPeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="dateRange.start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateRange.end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Filters based on report type */}
            {watchedType === "orders" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Methods</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedType === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchedType === "coupons" && (
              <FormField
                control={form.control}
                name="couponCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter coupon code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Export Options */}
            <div className="space-y-4">
              <FormLabel>Export Options</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="includeCharts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Charts</FormLabel>
                        <FormDescription>
                          Add visual charts and graphs to the report
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="includeDetails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Details</FormLabel>
                        <FormDescription>
                          Include detailed breakdowns and raw data
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Email Notification */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="emailNotification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Email Notification</FormLabel>
                      <FormDescription>
                        Send an email when the report is ready
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {watchedEmailNotification && (
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Error Display */}
            {generationError && (
              <Alert variant="destructive">
                <AlertDescription>{generationError}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
