"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  Edit,
  MoreVerticalIcon,
  PlusIcon,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  Percent,
  Users,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CouponsSkeleton } from "./coupons-skeleton";
import { Coupon } from "@/types/coupon.types";
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
  useActivateCouponMutation,
  useDeactivateCouponMutation,
  useBulkActivateCouponsMutation,
  useBulkDeactivateCouponsMutation,
  useBulkDeleteCouponsMutation,
} from "@/lib/features/coupons";
import {
  setCurrentPage,
  setPageSize,
  setSearchQuery,
  setIsActiveFilter,
  clearFilters,
  toggleCouponSelection,
  selectAllCoupons,
  clearSelection,
  setBulkOperationLoading,
  selectCurrentPage,
  selectPageSize,
  selectSearchQuery,
  selectIsActiveFilter,
  selectSelectedCoupons,
  selectIsBulkOperationLoading,
} from "@/lib/features/coupons";
import type { RootState, AppDispatch } from "@/lib/store";

// Schema for coupon data
const couponSchema = z.object({
  _id: z.string(),
  code: z.string(),
  description: z.string(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number(),
  minimumOrderValue: z.number(),
  maximumDiscountAmount: z.number().optional(),
  usageLimit: z.number(),
  usageCount: z.number(),
  validFrom: z.string(),
  validTo: z.string(),
  isActive: z.boolean(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  userRestrictions: z.object({
    firstTimeUsersOnly: z.boolean().optional(),
    specificUsers: z.array(z.string()).optional(),
    excludeUsers: z.array(z.string()).optional(),
  }).optional(),
  usageHistory: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function CouponsClient() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const currentPage = useSelector(selectCurrentPage);
  const pageSize = useSelector(selectPageSize);
  const searchQuery = useSelector(selectSearchQuery);
  const isActiveFilter = useSelector(selectIsActiveFilter);
  const selectedCoupons = useSelector(selectSelectedCoupons);
  const isBulkOperationLoading = useSelector(selectIsBulkOperationLoading);

  // Local state for table
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Redux API hooks
  const {
    data: couponsData,
    isLoading,
    error,
    refetch,
  } = useGetCouponsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    isActive: isActiveFilter !== null ? isActiveFilter : undefined,
  });

  // Mutation hooks
  const [deleteCoupon] = useDeleteCouponMutation();
  const [activateCoupon] = useActivateCouponMutation();
  const [deactivateCoupon] = useDeactivateCouponMutation();
  const [bulkActivateCoupons] = useBulkActivateCouponsMutation();
  const [bulkDeactivateCoupons] = useBulkDeactivateCouponsMutation();
  const [bulkDeleteCoupons] = useBulkDeleteCouponsMutation();

  // Extract data from API response
  const data = couponsData?.data?.coupons || [];
  const totalPages = couponsData?.data?.pagination?.pages || 0;
  const totalCoupons = couponsData?.data?.pagination?.total || 0;

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update Redux state when pagination changes
  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [searchQuery, isActiveFilter, dispatch]);

  // Handle edit button click
  const handleEditClick = (coupon: Coupon) => {
    router.push(`/coupons/edit/${coupon._id}`);
  };

  // Handle delete button click
  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      setIsDeleting(true);

      const loadingToast = toast.loading("Deleting coupon...");

      const result = await deleteCoupon(couponToDelete._id).unwrap();
      if (result.success) {
        setIsDeleteDialogOpen(false);
        setCouponToDelete(null);

        toast.dismiss(loadingToast);
        toast.success("Coupon deleted successfully", {
          description: `Deleted coupon "${couponToDelete.code}"`,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete coupon", {
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      toast.error("Error deleting coupon", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  // Handle activate/deactivate
  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const loadingToast = toast.loading(
        coupon.isActive ? "Deactivating coupon..." : "Activating coupon..."
      );

      const result = coupon.isActive
        ? await deactivateCoupon(coupon._id).unwrap()
        : await activateCoupon(coupon._id).unwrap();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(
          `Coupon ${coupon.isActive ? "deactivated" : "activated"} successfully`,
          {
            description: `Coupon "${coupon.code}" is now ${coupon.isActive ? "inactive" : "active"}`,
          }
        );
      } else {
        toast.dismiss(loadingToast);
        toast.error(`Failed to ${coupon.isActive ? "deactivate" : "activate"} coupon`, {
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Error toggling coupon status:", error);
      toast.error("Error updating coupon status", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle bulk activate
  const handleBulkActivate = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCoupons = selectedRows.map(row => row.original);

    if (selectedCoupons.length === 0) {
      toast.error("No coupons selected");
      return;
    }

    try {
      dispatch(setBulkOperationLoading(true));
      const loadingToast = toast.loading(`Activating ${selectedCoupons.length} coupon${selectedCoupons.length === 1 ? '' : 's'}...`);

      const result = await bulkActivateCoupons(selectedCoupons.map(c => c._id)).unwrap();

      if (result.success) {
        setRowSelection({});
        dispatch(clearSelection());
        toast.dismiss(loadingToast);
        toast.success(result.message);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Bulk activation failed", {
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Error in bulk activate:", error);
      toast.error("Error during bulk activation", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      dispatch(setBulkOperationLoading(false));
    }
  };

  // Handle bulk deactivate
  const handleBulkDeactivate = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCoupons = selectedRows.map(row => row.original);

    if (selectedCoupons.length === 0) {
      toast.error("No coupons selected");
      return;
    }

    try {
      dispatch(setBulkOperationLoading(true));
      const loadingToast = toast.loading(`Deactivating ${selectedCoupons.length} coupon${selectedCoupons.length === 1 ? '' : 's'}...`);

      const result = await bulkDeactivateCoupons(selectedCoupons.map(c => c._id)).unwrap();

      if (result.success) {
        setRowSelection({});
        dispatch(clearSelection());
        toast.dismiss(loadingToast);
        toast.success(result.message);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Bulk deactivation failed", {
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Error in bulk deactivate:", error);
      toast.error("Error during bulk deactivation", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      dispatch(setBulkOperationLoading(false));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCoupons = selectedRows.map(row => row.original);

    if (selectedCoupons.length === 0) {
      toast.error("No coupons selected");
      return;
    }

    // Check if any selected coupons have been used
    const usedCoupons = selectedCoupons.filter(coupon => coupon.usageCount > 0);
    if (usedCoupons.length > 0) {
      toast.error("Cannot delete used coupons", {
        description: `${usedCoupons.length} of the selected coupons have been used and cannot be deleted.`,
      });
      return;
    }

    try {
      dispatch(setBulkOperationLoading(true));
      const loadingToast = toast.loading(`Deleting ${selectedCoupons.length} coupon${selectedCoupons.length === 1 ? '' : 's'}...`);

      const result = await bulkDeleteCoupons(selectedCoupons.map(c => c._id)).unwrap();

      if (result.success) {
        setRowSelection({});
        dispatch(clearSelection());
        toast.dismiss(loadingToast);
        toast.success(result.message);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Bulk deletion failed", {
          description: result.message,
        });
      }
    } catch (error: any) {
      console.error("Error in bulk delete:", error);
      toast.error("Error during bulk deletion", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      dispatch(setBulkOperationLoading(false));
    }
  };


  // Helper functions
  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue}`;
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const isExpired = new Date(coupon.validTo) < now;
    const isNotStarted = new Date(coupon.validFrom) > now;

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isNotStarted) {
      return <Badge variant="outline">Not Started</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  const getUsageStatus = (coupon: Coupon) => {
    const usagePercentage = (coupon.usageCount / coupon.usageLimit) * 100;

    if (usagePercentage >= 100) {
      return <Badge variant="destructive">Fully Used</Badge>;
    } else if (usagePercentage >= 80) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Almost Used</Badge>;
    } else {
      return <Badge variant="outline">Available</Badge>;
    }
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-mono font-medium text-sm">
          {row.original.code}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.original.description}
        </div>
      ),
    },
    {
      id: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.discountType === 'percentage' ? (
            <Percent className="h-3 w-3 text-muted-foreground" />
          ) : (
            <DollarSign className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="font-medium">
            {getDiscountDisplay(row.original)}
          </span>
          {row.original.maximumDiscountAmount && (
            <span className="text-xs text-muted-foreground">
              (max ${row.original.maximumDiscountAmount})
            </span>
          )}
        </div>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.usageCount}/{row.original.usageLimit}</span>
          </div>
          {getUsageStatus(row.original)}
        </div>
      ),
    },
    {
      id: "validity",
      header: "Validity",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>
              {new Date(row.original.validFrom).toLocaleDateString()} - {new Date(row.original.validTo).toLocaleDateString()}
            </span>
          </div>
          {getStatusBadge(row.original)}
        </div>
      ),
    },
    {
      accessorKey: "minimumOrderValue",
      header: "Min Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          <span>${row.original.minimumOrderValue}</span>
        </div>
      ),
    },
    {
      id: "restrictions",
      header: "Restrictions",
      cell: ({ row }) => {
        const restrictions = [];
        if (row.original.userRestrictions?.firstTimeUsersOnly) {
          restrictions.push("First-time users");
        }
        if (row.original.applicableCategories?.length) {
          restrictions.push(`${row.original.applicableCategories.length} categories`);
        }
        if (row.original.applicableProducts?.length) {
          restrictions.push(`${row.original.applicableProducts.length} products`);
        }

        return restrictions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {restrictions.map((restriction, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {restriction}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(row.original)}
            className="h-8 w-8 p-0"
          >
            {row.original.isActive ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreVerticalIcon />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(row.original)}
                className="text-destructive"
                disabled={row.original.usageCount > 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({ pageIndex: currentPage - 1, pageSize });
        dispatch(setCurrentPage(newPagination.pageIndex + 1));
        dispatch(setPageSize(newPagination.pageSize));
      } else {
        dispatch(setCurrentPage(updater.pageIndex + 1));
        dispatch(setPageSize(updater.pageSize));
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // Show skeleton while loading
  if (isLoading) {
    return <CouponsSkeleton />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
            <p className="text-muted-foreground">
              Manage discount coupons and promotional codes
            </p>
          </div>
          <Button
            onClick={() => router.push("/coupons/add")}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(event) => {
                  dispatch(setSearchQuery(event.target.value));
                }}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ColumnsIcon />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bulk action buttons */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkActivate}
                  disabled={isBulkOperationLoading}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Activate ({table.getFilteredSelectedRowModel().rows.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                  disabled={isBulkOperationLoading}
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  Deactivate ({table.getFilteredSelectedRowModel().rows.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkOperationLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({table.getFilteredSelectedRowModel().rows.length})
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No coupons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} coupon(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => {
                    dispatch(setPageSize(Number(value)));
                  }}
                >
                  <SelectTrigger className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {currentPage} of{" "}
                {totalPages}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => dispatch(setCurrentPage(1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => dispatch(setCurrentPage(totalPages))}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[500px] p-0 overflow-hidden rounded-lg">
          <div className="bg-destructive/10 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-destructive/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold">Delete Coupon</h2>
                {couponToDelete && (
                  <p className="text-muted-foreground text-sm">
                    {couponToDelete.code}
                  </p>
                )}
              </div>
            </div>
          </div>

          {couponToDelete && (
            <div className="p-4 sm:p-6 pt-3 sm:pt-4">
              <p className="text-sm">
                Are you sure you want to delete this coupon? This action cannot be undone.
              </p>

              {couponToDelete.usageCount > 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-amber-500 mt-0.5 flex-shrink-0"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <span className="text-xs sm:text-sm text-amber-800">
                    This coupon has been used <strong>{couponToDelete.usageCount}</strong> time{couponToDelete.usageCount === 1 ? '' : 's'} and cannot be deleted.
                  </span>
                </div>
              )}

              {couponToDelete.usageCount === 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs sm:text-sm text-blue-800">
                    This coupon has not been used yet and can be safely deleted.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-muted/20 p-3 sm:p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="h-9 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || (couponToDelete?.usageCount ?? 0) > 0}
              className="h-9 w-full sm:w-auto sm:px-4"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Coupon"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

