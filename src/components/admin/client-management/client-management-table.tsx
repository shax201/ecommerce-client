"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Eye,
  UserCheck,
  UserX,
  ArrowUpDown,
} from "lucide-react";
import { Client } from "@/lib/services/client-management-service";
import { format } from "date-fns";
import { formatAddressForTable } from "@/lib/utils/address-utils";
import { EditClientDialog } from "./edit-client-dialog";
import { ViewClientDialog } from "./view-client-dialog";
import { ClientData } from "@/app/admin/clients/client.interface";
import { useUpdateClientStatusMutation } from "@/lib/features/clients";
import { toast } from "sonner";

interface ClientManagementTableProps {
  clients: Client[];
  selectedClients: string[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSelectClient: (clientId: string) => void;
  onDeselectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onBulkActions: () => void;
  onStatusChange?: () => void;
}

export function ClientManagementTable({
  clients,
  selectedClients,
  loading,
  error,
  pagination,
  sortBy,
  sortOrder,
  onSelectClient,
  onDeselectClient,
  onSelectAll,
  onSort,
  onPageChange,
  onLimitChange,
  onBulkActions,
  onStatusChange,
}: ClientManagementTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [updateClientStatus, { isLoading: isUpdatingStatus }] = useUpdateClientStatusMutation();

  const isAllSelected = clients.length > 0 && selectedClients.length === clients.length;
  const isIndeterminate = selectedClients.length > 0 && selectedClients.length < clients.length;

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />;
  };

  const handleEditClient = (client: Client) => {
    // Convert Client to ClientData
    const clientData: ClientData = {
      _id: client._id || '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email,
      role: 'client', // Default role
      phone: client.phone || 0,
      address: client.address || '',
      status: client.status ?? true,
      image: client.image,
      createdAt: client.createdAt?.toString() || new Date().toISOString(),
      updatedAt: client.updatedAt?.toString() || new Date().toISOString(),
    };
    setEditingClient(clientData);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingClient(null);
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingClient(null);
  };

  const handleStatusChange = async (clientId: string, newStatus: boolean) => {
    try {
      const result = await updateClientStatus({
        id: clientId,
        status: newStatus
      }).unwrap();

      if (result.success) {
        toast.success(
          `Client ${newStatus ? 'activated' : 'deactivated'} successfully`,
          {
            description: `Client status has been updated to ${newStatus ? 'active' : 'inactive'}.`,
          }
        );
        // Call the success callback to refresh data
        if (onStatusChange) {
          onStatusChange();
        }
      } else {
        toast.error("Failed to update client status", {
          description: result.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("Error updating client status:", error);
      toast.error("Error updating client status", {
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkActions}
          >
            Bulk Actions
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('firstName')}
                  className="h-8 px-2"
                >
                  Name
                  {getSortIcon('firstName')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('email')}
                  className="h-8 px-2"
                >
                  Email
                  {getSortIcon('email')}
                </Button>
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-8 px-2"
                >
                  Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('createdAt')}
                  className="h-8 px-2"
                >
                  Created
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading clients...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">No clients found</p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedClients.includes(client._id!)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectClient(client._id!);
                        } else {
                          onDeselectClient(client._id!);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {client.image ? (
                        <img
                          src={client.image}
                          alt={`${client.firstName} ${client.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {client.firstName?.[0]}{client.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-sm text-gray-500">ID: {client._id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{client.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{client.phone || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-32 truncate">
                      {formatAddressForTable(client.address, 32)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status ? 'default' : 'secondary'}>
                      {client.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {client.createdAt
                        ? format(new Date(client.createdAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
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
                        <DropdownMenuItem onClick={() => handleViewClient(client)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(client._id!, true)}
                          disabled={isUpdatingStatus || client.status === true}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(client._id!, false)}
                          disabled={isUpdatingStatus || client.status === false}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onLimitChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        client={editingClient}
      />

      {/* View Client Dialog */}
      <ViewClientDialog
        open={isViewDialogOpen}
        onOpenChange={handleCloseViewDialog}
        client={viewingClient}
      />
    </div>
  );
}
