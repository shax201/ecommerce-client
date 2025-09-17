"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
} from "@tanstack/react-table"
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
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SizeData, useDeleteSizeMutation, useGetSizesQuery } from "@/lib/features/attributes"

// Schema for size data
const sizeSchema = z.object({
  _id: z.string(),
  size: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
})

interface SizesClientProps {
  initialSizes: SizeData[]
}

export function SizesClient({ initialSizes }: SizesClientProps) {
  const router = useRouter()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [sizeToDelete, setSizeToDelete] = React.useState<SizeData | null>(null)
  
  // Redux hooks
  const { data: sizesResponse, refetch } = useGetSizesQuery()
  const [deleteSize, { isLoading: isDeleting }] = useDeleteSizeMutation()
  
  // Use Redux data or fallback to initial data
  const data = sizesResponse?.data || initialSizes

  // Handle edit button click
  const handleEditClick = (size: SizeData) => {
    toast("Edit mode", {
      description: `Editing size "${size.size}"`
    })
    // Implement edit functionality - navigate to edit page
    router.push(`/admin/attributes/sizes/edit/${size._id}`)
  }

  // Handle delete button click
  const handleDeleteClick = (size: SizeData) => {
    setSizeToDelete(size)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!sizeToDelete) return

    try {
      const loadingToast = toast.loading("Deleting size...")
      
      const result = await deleteSize(sizeToDelete._id).unwrap()
      
      toast.dismiss(loadingToast)
      
      // Refetch data to get updated list
      refetch()
      setIsDeleteDialogOpen(false)
      setSizeToDelete(null)
      toast.success("Size deleted successfully", {
        description: `Deleted size "${sizeToDelete.size}"`
      })
    } catch (error: any) {
      console.error("Error deleting size:", error)
      toast.error("Failed to delete size", {
        description: error?.data?.message || "An unexpected error occurred. Please try again."
      })
    }
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setSizeToDelete(null)
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedSizes = selectedRows.map(row => row.original)
    
    if (selectedSizes.length === 0) {
      toast.error("No sizes selected")
      return
    }

    try {
      const loadingToast = toast.loading(`Deleting ${selectedSizes.length} size(s)...`)
      
      // Delete sizes one by one
      const deletePromises = selectedSizes.map(size => deleteSize(size._id).unwrap())
      const results = await Promise.allSettled(deletePromises)
      
      // Check results
      const successfulDeletes = results.filter(result => 
        result.status === 'fulfilled'
      ).length
      
      const failedDeletes = results.length - successfulDeletes
      
      toast.dismiss(loadingToast)
      
      if (successfulDeletes > 0) {
        // Refetch data to get updated list
        refetch()
        setRowSelection({})
        
        if (failedDeletes === 0) {
          toast.success(`Successfully deleted ${successfulDeletes} size(s)`)
        } else {
          toast.warning(`Deleted ${successfulDeletes} size(s), ${failedDeletes} failed`)
        }
      } else {
        toast.error("Failed to delete sizes")
      }
    } catch (error) {
      console.error("Error in bulk delete:", error)
      toast.error("An unexpected error occurred during bulk delete")
    }
  }

  // Get size category based on size value
  const getSizeCategory = (size: string): string => {
    const sizeMap: Record<string, string> = {
      'XS': 'Extra Small',
      'S': 'Small',
      'M': 'Medium',
      'L': 'Large',
      'XL': 'Extra Large',
      'XXL': '2X Large',
      '3XL': '3X Large',
      '4XL': '4X Large',
      '5XL': '5X Large'
    };
    
    return sizeMap[size] || size;
  }

  const columns: ColumnDef<z.infer<typeof sizeSchema>>[] = [
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
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original._id.substring(0, 8)}...</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-base font-semibold px-3 py-1">
          {row.original.size}
        </Badge>
      ),
      enableHiding: false,
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }) => (
        <div>{getSizeCategory(row.original.size)}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => (
        <div>{new Date(row.original.updatedAt).toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
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
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sizes</h2>
            <p className="text-muted-foreground">Manage product size attributes</p>
          </div>
          <Button onClick={() => router.push("/admin/attributes/sizes/add")}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Size
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sizes..."
                value={(table.getColumn("size")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("size")?.setFilterValue(event.target.value)
                }
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
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
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
                      )
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
                      No sizes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
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
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
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
                <h2 className="text-lg sm:text-xl font-bold">Delete Size</h2>
                {sizeToDelete && (
                  <p className="text-muted-foreground text-sm truncate">{sizeToDelete.size}</p>
                )}
              </div>
            </div>
          </div>
          
          {sizeToDelete && (
            <div className="p-4 sm:p-6 pt-3 sm:pt-4">
              <p className="text-sm">
                Are you sure you want to delete this size? This action cannot be undone.
              </p>
              
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mt-0.5 flex-shrink-0">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                </svg>
                <span className="text-xs sm:text-sm text-amber-800">
                  Products using this size may be affected.
                </span>
              </div>
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
              disabled={isDeleting}
              className="h-9 w-full sm:w-auto sm:px-4"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Size"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}