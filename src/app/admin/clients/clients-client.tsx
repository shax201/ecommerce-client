"use client";

import * as React from "react";
import { useEffect } from "react";
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
  Eye,
  Edit,
  MoreVerticalIcon,
  Search,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";

import { Button } from "@/components/ui/button";

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
import { ClientsSkeleton } from "./clients-skeleton";
import { EditClientDialog } from "@/components/admin/client-management/edit-client-dialog";
import { 
  useGetClientsQuery, 
  useDeleteClientMutation,
  useBulkDeleteClientsMutation,
  useUpdateClientMutation,
  useUpdateClientStatusMutation,
  useBulkUpdateClientStatusMutation
} from "@/lib/features/clients";
import { ClientData, AddressObject } from "./client.interface";
import { formatAddress } from "./address-utils";
import { 
  setSearchTerm, 
  setSorting, 
  setPage, 
  setLimit,
  clearSelection,
  setSelectedClients 
} from "@/lib/features/clients/clientSlice";

// Schema for client data
const clientSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.string(),
  phone: z.number(),
  address: z.union([z.string(), z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  })]),
  status: z.boolean(),
  image: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function ClientsClient() {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    searchTerm, 
    sortBy, 
    sortOrder, 
    pagination,
    selectedClients 
  } = useSelector((state: RootState) => state.clients);

  // Redux queries and mutations
  const { 
    data: clientsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetClientsQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();
  const [bulkDeleteClients, { isLoading: isBulkDeleting }] = useBulkDeleteClientsMutation();
  const [updateClientStatus, { isLoading: isUpdatingStatus }] = useUpdateClientStatusMutation();
  const [bulkUpdateClientStatus, { isLoading: isBulkUpdatingStatus }] = useBulkUpdateClientStatusMutation();

  // Local state for UI
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSortingState] = React.useState<SortingState>([]);
  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [clientToDelete, setClientToDelete] = React.useState<ClientData | null>(null);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<ClientData | null>(null);

  // Get clients data from Redux response
  const rawData = clientsResponse?.data;
  const data: ClientData[] = Array.isArray(rawData) 
    ? rawData.map(client => ({
        _id: client._id || '',
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email,
        role: 'client', // Default role since Client interface doesn't have role
        phone: client.phone || 0,
        address: client.address || '', // Keep as is - will be handled in rendering
        status: client.status ?? true,
        image: client.image,
        createdAt: client.createdAt?.toString() || new Date().toISOString(),
        updatedAt: client.updatedAt?.toString() || new Date().toISOString(),
      }))
    : [];
  const totalPages = clientsResponse?.pagination?.pages || 0;
  const totalItems = clientsResponse?.pagination?.total || 0;

  // Update pagination state when Redux pagination changes
  useEffect(() => {
    setPaginationState({
      pageIndex: pagination.page - 1,
      pageSize: pagination.limit,
    });
  }, [pagination.page, pagination.limit]);

  // Sync row selection with Redux selectedClients
  useEffect(() => {
    const selectionObj: Record<string, boolean> = {};
    selectedClients.forEach(id => {
      selectionObj[id] = true;
    });
    setRowSelection(selectionObj);
  }, [selectedClients]);

  // Handle view client
  const handleViewClient = (client: ClientData) => {
    // Navigate to client details page
    window.location.href = `/clients/${client._id}`;
  };

  // Handle edit client
  const handleEditClient = (client: ClientData) => {
    setEditingClient(client);
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (client: ClientData) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      console.log("Attempting to delete client:", clientToDelete._id);
      const loadingToast = toast.loading("Deleting client...");

      const result = await deleteClient(clientToDelete._id).unwrap();
      console.log("Delete result:", result);

      if (result.success) {
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
        toast.dismiss(loadingToast);
        toast.success("Client deleted successfully", {
          description: `Deleted client "${clientToDelete.firstName} ${clientToDelete.lastName}"`,
        });
        // Refresh the clients list
        refetch();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete client", {
          description: result.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error("Error deleting client", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  // Handle status toggle for individual client
  const handleStatusToggle = async (client: ClientData) => {
    try {
      const loadingToast = toast.loading(`${client.status ? 'Deactivating' : 'Activating'} client...`);

      const result = await updateClientStatus({
        id: client._id,
        status: !client.status
      }).unwrap();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(`Client ${!client.status ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update client status", {
          description: result.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("Error updating client status:", error);
      toast.error("Failed to update client status", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: boolean) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedClientIds = selectedRows.map((row) => row.original._id);

    if (selectedClientIds.length === 0) {
      toast.error("No clients selected");
      return;
    }

    try {
      const loadingToast = toast.loading(`${status ? 'Activating' : 'Deactivating'} ${selectedClientIds.length} client(s)...`);

      const result = await bulkUpdateClientStatus({
        ids: selectedClientIds,
        status
      }).unwrap();

      if (result.success) {
        dispatch(clearSelection());
        setRowSelection({});
        toast.dismiss(loadingToast);
        toast.success(`Successfully ${status ? 'activated' : 'deactivated'} ${selectedClientIds.length} client(s)`);
      } else {
        toast.dismiss(loadingToast);
        toast.error(`Failed to ${status ? 'activate' : 'deactivate'} clients`, {
          description: result.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("Error bulk updating client status:", error);
      toast.error(`Failed to ${status ? 'activate' : 'deactivate'} clients`, {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedClientIds = selectedRows.map((row) => row.original._id);

    if (selectedClientIds.length === 0) {
      toast.error("No clients selected");
      return;
    }

    try {
      const loadingToast = toast.loading(`Deleting ${selectedClientIds.length} client(s)...`);

      const result = await bulkDeleteClients(selectedClientIds).unwrap();

      if (result.success) {
        dispatch(clearSelection());
        setRowSelection({});
        toast.dismiss(loadingToast);
        toast.success(`Successfully deleted ${selectedClientIds.length} client(s)`);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete clients", {
          description: result.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("Error bulk deleting clients:", error);
      toast.error("Failed to delete clients", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Get status styles
  const getStatusStyles = (status: boolean) => {
    return status
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const StatusDot = ({ status }: { status: boolean }) => {
    const dotColor = status ? "bg-green-500" : "bg-gray-400";
    return <div className={`w-2 h-2 rounded-full ${dotColor}`} />;
  };

  const columns: ColumnDef<ClientData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
      accessorKey: "firstName",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            {row.original.image ? (
              <img
                src={row.original.image}
                alt={`${row.original.firstName} ${row.original.lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                <span className="text-white font-medium text-sm">
                  {`${row.original.firstName} ${row.original.lastName}`
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{`${row.original.firstName} ${row.original.lastName}`}</div>
            <div className="text-sm text-gray-500">
              Member since {new Date(row.original.createdAt).getFullYear()}
            </div>
          </div>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "_id",
      header: "Client ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-600">
          #{row.original._id.slice(-6)}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact Info",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Mail className="mr-2 h-3 w-3 text-gray-400" />
            {row.original.email}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="mr-2 h-3 w-3 text-gray-400" />
            {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <button
          onClick={() => handleStatusToggle(row.original)}
          disabled={isUpdatingStatus}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusStyles(row.original.status)}`}
        >
          <StatusDot status={row.original.status} />
          {row.original.status ? "Active" : "Inactive"}
          {isUpdatingStatus && (
            <svg
              className="animate-spin h-3 w-3"
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
          )}
        </button>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex items-start text-sm max-w-xs">
          <MapPin className="mr-2 h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600 line-clamp-2">
            {formatAddress(row.original.address)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
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
              <DropdownMenuItem onClick={() => handleViewClient(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClient(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
    
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
      pagination: paginationState,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      
      // Update Redux selectedClients
      const selectedIds = Object.keys(newSelection).filter(key => newSelection[key]);
      dispatch(setSelectedClients(selectedIds));
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSortingState(newSorting);
      
      if (newSorting.length > 0) {
        const sort = newSorting[0];
        dispatch(setSorting({
          sortBy: sort.id,
          sortOrder: sort.desc ? 'desc' : 'asc'
        }));
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(paginationState) : updater;
      setPaginationState(newPagination);
      
      // Update Redux pagination
      dispatch(setPage(newPagination.pageIndex + 1));
      dispatch(setLimit(newPagination.pageSize));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return <ClientsSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <div className="w-full p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Client Management
              </h1>
              <p className="text-gray-600">
                Manage and track your client database
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <User className="h-4 w-4" />
              Add Client
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(event) => {
                  dispatch(setSearchTerm(event.target.value));
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
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={isBulkUpdatingStatus}
                >
                  {isBulkUpdatingStatus ? "Activating..." : `Activate Selected (${table.getFilteredSelectedRowModel().rows.length})`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={isBulkUpdatingStatus}
                >
                  {isBulkUpdatingStatus ? "Deactivating..." : `Deactivate Selected (${table.getFilteredSelectedRowModel().rows.length})`}
                </Button>
  
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
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
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
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
                        No clients found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {totalItems} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${pagination.limit}`}
                  onValueChange={(value) => {
                    dispatch(setLimit(Number(value)));
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
                Page {pagination.page} of {totalPages}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => dispatch(setPage(1))}
                  disabled={pagination.page <= 1}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => dispatch(setPage(pagination.page - 1))}
                  disabled={pagination.page <= 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => dispatch(setPage(pagination.page + 1))}
                  disabled={pagination.page >= totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => dispatch(setPage(totalPages))}
                  disabled={pagination.page >= totalPages}
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
                <h2 className="text-lg sm:text-xl font-bold">Delete Client</h2>
                {clientToDelete && (
                  <p className="text-muted-foreground text-sm truncate">
                    {clientToDelete.firstName} {clientToDelete.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {clientToDelete && (
            <div className="p-4 sm:p-6 pt-3 sm:pt-4">
              <p className="text-sm">
                Are you sure you want to delete this client? This action cannot
                be undone.
              </p>

              <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-muted/30 border rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    {clientToDelete.image ? (
                      <img
                        src={clientToDelete.image}
                        alt={`${clientToDelete.firstName} ${clientToDelete.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                        <span className="text-white font-medium text-xs">
                          {`${clientToDelete.firstName} ${clientToDelete.lastName}`
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {clientToDelete.firstName} {clientToDelete.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {clientToDelete.email}
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
                "Delete Client"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <EditClientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={editingClient}
      />
    </div>
  );
}
