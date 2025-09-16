"use client"

import * as React from "react"
import { useEffect } from "react"
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
  Eye,
  Edit,
  MoreVerticalIcon,
  Search,
  Trash2,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import Image from "next/image"
import { useRouter } from "next/navigation"

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
import { ProductsSkeleton } from "./products-skeleton"
import { fetchProducts, deleteProduct } from "./products-data"
import { ProductData } from "./product.interface"

// Schema for product data
const productSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  primaryImage: z.string(),
  optionalImages: z.array(z.string()),
  regularPrice: z.number(),
  discountPrice: z.number(),
  videoLink: z.string().optional(),
  catagory: z.array(z.string()),
  color: z.array(z.string()).optional(),
  size: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  variants: z.object({
    color: z.array(z.string()).optional(),
    size: z.array(z.string()).optional(),
  }).optional(),
})

export function ProductsClient() {
  const [data, setData] = React.useState<ProductData[]>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  // Confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [productToDelete, setProductToDelete] = React.useState<ProductData | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  // Function to load products
  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const products = await fetchProducts()
      setData(products)
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Failed to load products", {
        description: "Please try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle view product
  const handleViewProduct = (product: ProductData) => {
    router.push(`/products/view/${product._id}`)
  }

  // Handle edit product
  const handleEditProduct = (product: ProductData) => {
    router.push(`/products/edit/${product._id}`)
  }

  // Handle delete button click
  const handleDeleteClick = (product: ProductData) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      setIsDeleting(true)
      
      const loadingToast = toast.loading("Deleting product...")
      
      const success = await deleteProduct(productToDelete._id)
      if (success) {
        await loadProducts()
        setIsDeleteDialogOpen(false)
        setProductToDelete(null)
        
        toast.dismiss(loadingToast)
        toast.success("Product deleted successfully", {
          description: `Deleted product "${productToDelete.title}"`
        })
      } else {
        toast.dismiss(loadingToast)
        toast.error("Failed to delete product", {
          description: "Please try again later."
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error deleting product", {
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedProducts = selectedRows.map(row => row.original)
    
    if (selectedProducts.length === 0) {
      toast.error("No products selected")
      return
    }

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setData(data.filter(product => !selectedProducts.find(selected => selected._id === product._id)))
          setRowSelection({})
          resolve(true)
        }, 1000)
      }),
      {
        loading: `Deleting ${selectedProducts.length} product(s)...`,
        success: `Successfully deleted ${selectedProducts.length} product(s)`,
        error: "Failed to delete products",
      }
    )
  }

  // Get category display text
  const getCategoryDisplay = (product: ProductData) => {
    if (!product.catagory || product.catagory.length === 0) {
      return "No Category"
    }
    if (typeof product.catagory[0] === "object" && product.catagory[0] !== null) {
      // @ts-ignore
      return product.catagory.map((cat: any) => cat.title).join(", ")
    }
    return product.catagory.join(", ")
  }

  // Get stock status
  const getStockStatus = (product: ProductData) => {
    return "In Stock"
  }

  // Get price display
  const getPriceDisplay = (product: ProductData) => {
    if (product.discountPrice && product.discountPrice < product.regularPrice) {
      return (
        <div className="flex flex-col">
          <span className="text-sm line-through text-muted-foreground">
            ${product.regularPrice}
          </span>
          <span className="font-medium text-green-600">
            ${product.discountPrice}
          </span>
        </div>
      )
    }
    return <span className="font-medium">${product.regularPrice}</span>
  }

  const columns: ColumnDef<z.infer<typeof productSchema>>[] = [
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
      accessorKey: "primaryImage",
      header: "Image",
      cell: ({ row }) => (
        <Image
          src={row.original.primaryImage || "/placeholder.svg"}
          alt={row.original.title}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.original.title}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "catagory",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {getCategoryDisplay(row.original)}
        </div>
      ),
    },
    {
      accessorKey: "regularPrice",
      header: "Price",
      cell: ({ row }) => getPriceDisplay(row.original),
    },
    {
      accessorKey: "variants",
      header: "Variants",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.variants?.color && row.original.variants.color.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {row.original.variants.color.length} color{row.original.variants.color.length > 1 ? 's' : ''}
            </Badge>
          )}
          {row.original.variants?.size && row.original.variants.size.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {row.original.variants.size.length} size{row.original.variants.size.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="default">{getStockStatus(row.original)}</Badge>
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
              <DropdownMenuItem onClick={() => handleViewProduct(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditProduct(row.original)}>
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

  if (isLoading) {
    return <ProductsSkeleton />
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={() => router.push("/products/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
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
                      No products found.
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
                <h2 className="text-lg sm:text-xl font-bold">Delete Product</h2>
                {productToDelete && (
                  <p className="text-muted-foreground text-sm truncate">{productToDelete.title}</p>
                )}
              </div>
            </div>
          </div>
          
          {productToDelete && (
            <div className="p-4 sm:p-6 pt-3 sm:pt-4">
              <p className="text-sm">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              
              <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-muted/30 border rounded-md">
                <div className="flex items-center gap-3">
                  <Image
                    src={productToDelete.primaryImage || "/placeholder.svg"}
                    alt={productToDelete.title}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{productToDelete.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Price: ${productToDelete.discountPrice || productToDelete.regularPrice}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Category: {getCategoryDisplay(productToDelete)}
                    </p>
                  </div>
                </div>
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
                "Delete Product"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 