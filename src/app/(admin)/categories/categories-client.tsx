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
import { AddCategoryDialog } from "@/components/dashboard/add-category-dialog"
import { CategoriesSkeleton } from "./categories-skeleton"
import { deleteCategory, fetchCategories, fetchProductsByCategory } from "./categories-data"
import { CategoryData, CategoryWithSubCategories } from "./categroy.interface"
import { updateCategory } from "@/actions/category"

// Schema for category data
const categorySchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  parent: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  productCount: z.number(),
})

export function CategoriesClient() {
  const [data, setData] = React.useState<CategoryData[]>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [categoryToEdit, setCategoryToEdit] = React.useState<CategoryData | null>(null)

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryData | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deleteWithSubCategories, setDeleteWithSubCategories] = React.useState<boolean | undefined>(undefined)

  // Fetch data on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Refresh categories when dialog closes
  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      setIsEditMode(false)
      setCategoryToEdit(null)
      loadCategories()
    }
  }

  // Handle edit button click
  const handleEditClick = (category: CategoryData) => {
    setCategoryToEdit(category)
    setIsEditMode(true)
    setIsAddDialogOpen(true)
    
    toast.info("Edit mode", {
      description: `Editing category "${category.title}"`
    })
  }

  // Handle delete button click
  const handleDeleteClick = (category: CategoryData) => {
    setCategoryToDelete(category)
    
    const hasSubCategories = data.filter(cat => cat.parent === category._id).length > 0
    setDeleteWithSubCategories(hasSubCategories ? undefined : true)
    
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    const subCategories = getSubCategories(categoryToDelete._id)
    if (subCategories.length > 0 && deleteWithSubCategories === undefined) return

    try {
      setIsDeleting(true)
      
      const loadingToast = toast.loading("Deleting category...")
      
      if (subCategories.length > 0) {
        if (deleteWithSubCategories) {
          console.log(`Deleting ${subCategories.length} sub-categories first`)
          for (const subCategory of subCategories) {
            await deleteCategory(subCategory._id)
          }
        } else {
          console.log(`Updating ${subCategories.length} sub-categories to remove parent reference`)
          for (const subCategory of subCategories) {
            await updateCategory(subCategory._id, {
              name: subCategory.title,
              description: subCategory.description,
              parentCategory: undefined
            })
          }
        }
      }
      
      const success = await deleteCategory(categoryToDelete._id)
      if (success) {
        await loadCategories()
        setIsDeleteDialogOpen(false)
        setCategoryToDelete(null)
        setDeleteWithSubCategories(undefined)
        
        toast.dismiss(loadingToast)
        toast.success("Category deleted successfully", {
          description: subCategories.length > 0 
            ? deleteWithSubCategories 
              ? `Deleted category "${categoryToDelete.title}" and ${subCategories.length} sub-categor${subCategories.length === 1 ? 'y' : 'ies'}`
              : `Deleted category "${categoryToDelete.title}" and preserved ${subCategories.length} sub-categor${subCategories.length === 1 ? 'y' : 'ies'}`
            : `Deleted category "${categoryToDelete.title}"`
        })
      } else {
        toast.dismiss(loadingToast)
        toast.error("Failed to delete category", {
          description: "Please try again later."
        })
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Error deleting category", {
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCategoryToDelete(null)
    setDeleteWithSubCategories(undefined)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCategories = selectedRows.map(row => row.original)
    
    if (selectedCategories.length === 0) {
      toast.error("No categories selected")
      return
    }

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setData(data.filter(category => !selectedCategories.find(selected => selected._id === category._id)))
          setRowSelection({})
          resolve(true)
        }, 1000)
      }),
      {
        loading: `Deleting ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}...`,
        success: `Successfully deleted ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}`,
        error: "Failed to delete categories",
      }
    )
  }

  // Function to load categories
  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const categories = await fetchCategories()
      
      const categoriesWithProductCounts = await Promise.all(
        categories.map(async (category: CategoryData) => {
          const products = await fetchProductsByCategory(category._id)
          return {
            ...category,
            productCount: products.length
          }
        })
      )

      setData(categoriesWithProductCounts)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const isSubCategory = (category: CategoryData): boolean => {
    return category.parent !== null
  }

  const getParentTitle = (category: CategoryData): string => {
    if (!category.parent) return ""
    const parent = data.find(cat => cat._id === category.parent)
    return parent?.title || ""
  }

  const getSubCategories = (categoryId: string): CategoryData[] => {
    return data.filter(cat => cat.parent === categoryId)
  }

  const columns: ColumnDef<z.infer<typeof categorySchema>>[] = [
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
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">{row.original.description}</div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Badge variant={isSubCategory(row.original) ? "secondary" : "default"}>
            {isSubCategory(row.original) ? "Sub-category" : "Parent Category"}
          </Badge>
          {!isSubCategory(row.original) && getSubCategories(row.original._id).length > 0 && (
            <Badge variant="outline" className="text-xs">
              {getSubCategories(row.original._id).length} sub-categor{getSubCategories(row.original._id).length === 1 ? 'y' : 'ies'}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "parentCategory",
      header: "Parent Category",
      cell: ({ row }) => (
        <div>
          {isSubCategory(row.original) ? (
            <span className="text-sm text-muted-foreground">
              {getParentTitle(row.original)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.productCount} {row.original.productCount === 1 ? 'product' : 'products'}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
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

  // Show skeleton while loading
  if (isLoading) {
    return <CategoriesSkeleton />
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">Organize your products with categories</p>
          </div>
          <Button onClick={() => {
            setIsEditMode(false)
            setCategoryToEdit(null)
            setIsAddDialogOpen(true)
          }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
                      No categories found.
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
      
      {/* Add Category Dialog */}
      <AddCategoryDialog 
        open={isAddDialogOpen} 
        onOpenChange={handleDialogClose}
        editMode={isEditMode}
        categoryToEdit={categoryToEdit}
        categories={data}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[500px] p-0 overflow-hidden rounded-lg">
          <div className="bg-destructive/10 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-destructive/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold">Delete Category</h2>
                {categoryToDelete && (
                  <p className="text-muted-foreground text-sm truncate">{categoryToDelete.title}</p>
                )}
              </div>
            </div>
          </div>
          
          {categoryToDelete && (
            <div className="p-4 sm:p-6 pt-3 sm:pt-4">
              <p className="text-sm">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              
              {categoryToDelete.productCount > 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mt-0.5 flex-shrink-0">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <span className="text-xs sm:text-sm text-amber-800">
                    This category contains <strong>{categoryToDelete.productCount}</strong> product{categoryToDelete.productCount === 1 ? '' : 's'}.
                  </span>
                </div>
              )}
              
              {getSubCategories(categoryToDelete._id).length > 0 && (
                <div className="mt-4 sm:mt-5 border rounded-md overflow-hidden">
                  <div className="bg-muted/50 p-2 sm:p-3 border-b">
                    <p className="font-medium text-sm">
                      This category has {getSubCategories(categoryToDelete._id).length} sub-categor{getSubCategories(categoryToDelete._id).length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                  
                  <div className="p-2 sm:p-3 bg-background">
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      {getSubCategories(categoryToDelete._id).map(cat => (
                        <li key={cat._id} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0"></div>
                          <span className="truncate">{cat.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t p-2 sm:p-3">
                    <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Choose how to handle sub-categories:</p>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-md hover:bg-muted/30 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="deleteOption"
                          value="with"
                          checked={deleteWithSubCategories === true}
                          onChange={() => setDeleteWithSubCategories(true)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="font-medium text-sm">Delete with sub-categories</span>
                          <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            All sub-categories will be permanently deleted along with this category.
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-md hover:bg-muted/30 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="deleteOption"
                          value="without"
                          checked={deleteWithSubCategories === false}
                          onChange={() => setDeleteWithSubCategories(false)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="font-medium text-sm">Keep sub-categories</span>
                          <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            Sub-categories will be converted to parent categories and preserved.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
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
              disabled={
                isDeleting ||
                Boolean(
                  categoryToDelete &&
                  getSubCategories(categoryToDelete._id).length > 0 &&
                  deleteWithSubCategories === undefined
                )
              }
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
                categoryToDelete && getSubCategories(categoryToDelete._id).length > 0 
                  ? deleteWithSubCategories === true 
                    ? "Delete All Categories" 
                    : deleteWithSubCategories === false 
                      ? "Delete Only Parent" 
                      : "Select an Option"
                  : "Delete Category"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 