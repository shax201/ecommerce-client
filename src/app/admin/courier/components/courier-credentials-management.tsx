"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store";
import {
  useGetCourierCredentialsQuery,
  useGetActiveCouriersQuery,
  useCreateCourierCredentialsMutation,
  useUpdateCourierCredentialsMutation,
  useToggleCourierCredentialsStatusMutation,
  useDeleteCourierCredentialsMutation,
} from "@/lib/features/courier/courierApi";
import { useToast } from "@/hooks/use-toast";
import {
  setCredentialsFormOpen,
  setCredentialsEditMode,
  setEditingCredentialsId,
  setSelectedCredentials,
  setCredentialsForm,
  clearCredentialsForm,
  setSearchQuery,
  setCourierFilter,
  setActiveFilter,
  clearFilters,
  setCredentialsList,
  setActiveCouriers,
  setPagination,
  setCurrentPage,
} from "@/lib/features/courier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter, X } from "lucide-react";
import { CourierCredentialsFormData, CourierType } from "@/types/courier.types";
import Link from "next/link";

export default function CourierCredentialsManagement() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const {
    credentials = { list: [], activeCouriers: [], selectedCourier: null, isCredentialsLoading: false, credentialsError: null },
    filters = { search: '', courier: undefined, status: undefined, isActive: undefined, dateFrom: undefined, dateTo: undefined },
    pagination = { page: 1, limit: 10, total: 0, totalPages: 0 },
    ui: { selectedCredentials = [] } = {},
  } = useAppSelector((state: RootState) => state.courier);

  // API hooks
  const {
    data: credentialsData,
    isLoading: isCredentialsLoading,
    error: credentialsError,
    refetch: refetchCredentials,
  } = useGetCourierCredentialsQuery();

  const {
    data: activeCouriersData,
    isLoading: isActiveCouriersLoading,
  } = useGetActiveCouriersQuery();

  const [toggleStatus, { isLoading: isToggling }] = useToggleCourierCredentialsStatusMutation();
  const [deleteCredentials, { isLoading: isDeleting }] = useDeleteCourierCredentialsMutation();

  // Local state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialsToDelete, setCredentialsToDelete] = useState<string | null>(null);

  // Update Redux state when API data changes
  useEffect(() => {
    if (credentialsData?.success && credentialsData.data) {
      dispatch(setCredentialsList(credentialsData.data));
    }
  }, [credentialsData, dispatch]);

  useEffect(() => {
    if (activeCouriersData?.success && activeCouriersData.data) {
      dispatch(setActiveCouriers(activeCouriersData.data as CourierType[]));
    }
  }, [activeCouriersData, dispatch]);

  // Handlers
  const handleEditCredentials = (credentials: any) => {
    // TODO: Implement edit functionality or redirect to edit page
    console.log('Edit credentials:', credentials);
  };

  const handleToggleStatus = async (courier: CourierType) => {
    try {
      const cred = credentials.list.find(c => c.courier === courier);
      if (cred) {
        const result = await toggleStatus({
          courier: courier,
          action: cred.isActive ? 'deactivate' : 'activate'
        }).unwrap();
        
        if (result.success) {
          toast({
            title: "Status Updated",
            description: result.message || `${courier} credentials ${cred.isActive ? 'deactivated' : 'activated'} successfully`,
            variant: "success",
          });
          refetchCredentials();
        }
      }
    } catch (error: any) {
      console.error('Failed to toggle status:', error);
      toast({
        title: "Error",
        description: error?.data?.message || `Failed to toggle ${courier} status`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCredentials = async (courier: CourierType) => {
    try {
      const result = await deleteCredentials(courier).unwrap();
      if (result.success) {
        toast({
          title: "Credentials Deleted",
          description: result.message || `${courier} credentials deleted successfully`,
          variant: "success",
        });
        refetchCredentials();
        setDeleteDialogOpen(false);
        setCredentialsToDelete(null);
      }
    } catch (error: any) {
      console.error('Failed to delete credentials:', error);
      toast({
        title: "Error",
        description: error?.data?.message || `Failed to delete ${courier} credentials`,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    // Implement bulk delete logic
    console.log('Bulk delete selected credentials:', selectedCredentials);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = (credentials.list || []).map(cred => cred._id);
      dispatch(setSelectedCredentials(allIds));
    } else {
      dispatch(setSelectedCredentials([]));
    }
  };

  const handleSelectCredentials = (id: string, checked: boolean) => {
    if (checked) {
      dispatch(setSelectedCredentials([...selectedCredentials, id]));
    } else {
      dispatch(setSelectedCredentials(selectedCredentials.filter(credId => credId !== id)));
    }
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleCourierFilter = (value: string) => {
    dispatch(setCourierFilter(value === 'all' ? undefined : value as CourierType));
  };

  const handleActiveFilter = (value: string) => {
    dispatch(setActiveFilter(value === 'all' ? undefined : value === 'active'));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  if (isCredentialsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Courier Credentials</h3>
          <p className="text-sm text-muted-foreground">
            Manage courier service credentials and settings
          </p>
        </div>
        <Link href="/admin/courier/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Credentials
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search credentials..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filters.courier || 'all'} onValueChange={handleCourierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Couriers</SelectItem>
                <SelectItem value="pathao">Pathao</SelectItem>
                <SelectItem value="steadfast">Steadfast</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'} onValueChange={handleActiveFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCredentials.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedCredentials.length} credentials selected
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credentials List</CardTitle>
          <CardDescription>
            Manage courier service credentials and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCredentials.length === (credentials.list?.length || 0) && (credentials.list?.length || 0) > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(credentials.list || []).map((cred) => (
                <TableRow key={cred._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCredentials.includes(cred._id)}
                      onCheckedChange={(checked) => handleSelectCredentials(cred._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="capitalize">{cred.courier}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {cred.credentials?.base_url ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={cred.isActive ? 'default' : 'secondary'}>
                        {cred.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(cred.courier)}
                        disabled={isToggling}
                      >
                        {cred.isActive ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(cred.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(cred.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCredentials(cred)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCredentialsToDelete(cred.courier);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(credentials.list || []).length} of {pagination.total} credentials
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => dispatch(setCurrentPage(pagination.page - 1))}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => dispatch(setCurrentPage(pagination.page + 1))}
          >
            Next
          </Button>
        </div>
      </div>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credentials</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete these credentials? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => credentialsToDelete && handleDeleteCredentials(credentialsToDelete as CourierType)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
