"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { UserManagementTable } from "@/components/admin/user-management/user-management-table";
import { UserManagementFilters } from "@/components/admin/user-management/user-management-filters";
import { UserManagementStats } from "@/components/admin/user-management/user-management-stats";
import { CreateUserDialog } from "@/components/admin/user-management/create-user-dialog";
import { BulkActionsDialog } from "@/components/admin/user-management/bulk-actions-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, Download, Upload, RefreshCw } from "lucide-react";
import { UserQuery } from "@/lib/services/user-management-service";
import { 
  setSelectedUsers, 
  clearSelection,
  setFilters,
  resetFilters,
  setUsers,
  setStats,
  setPagination,
  setLoading,
  setError,
  useGetUsersQuery,
  useGetUserStatsQuery
} from "@/lib/features/user-management";

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    selectedUsers, 
    users, 
    stats, 
    pagination, 
    loading, 
    error, 
    filters 
  } = useSelector((state: RootState) => state.userManagement);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Memoize initial query to prevent infinite re-renders
  const initialQuery = useMemo((): UserQuery => ({
    page: 1,
    limit: 10,
    search: "",
    role: undefined,
    status: undefined,
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  }), []);

  // Use Redux RTK Query hooks for data fetching
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useGetUsersQuery(filters);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useGetUserStatsQuery();

  // Update Redux state when API data changes
  useEffect(() => {
    if (usersData) {
      dispatch(setUsers(usersData.data));
      dispatch(setPagination(usersData.pagination));
      dispatch(setLoading(false));
    }
    if (usersError) {
      let errorMessage = 'Failed to fetch users';
      if ('data' in usersError && usersError.data) {
        errorMessage = (usersError.data as any)?.message || errorMessage;
      } else if ('message' in usersError) {
        errorMessage = usersError.message || errorMessage;
      }
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
    }
  }, [usersData, usersError, dispatch]);

  useEffect(() => {
    if (statsData) {
      dispatch(setStats(statsData.data));
    }
  }, [statsData, dispatch]);

  // Set loading state
  useEffect(() => {
    dispatch(setLoading(usersLoading || statsLoading));
  }, [usersLoading, statsLoading, dispatch]);

  // Clear error when starting new request
  useEffect(() => {
    if (usersLoading || statsLoading) {
      dispatch(setError(null));
    }
  }, [usersLoading, statsLoading, dispatch]);

  const handleFilterChange = (newFilters: Partial<UserQuery>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleUserCreated = () => {
    setShowCreateDialog(false);
    refetchUsers();
    refetchStats();
  };

  const handleUserUpdated = () => {
    refetchUsers();
    refetchStats();
  };

  const handleBulkAction = () => {
    setShowBulkActions(false);
    dispatch(clearSelection());
    refetchUsers();
    refetchStats();
  };

  const handleSelectionChange = (userIds: string[]) => {
    dispatch(setSelectedUsers(userIds));
  };

  const handleRefresh = () => {
    refetchUsers();
    refetchStats();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {/* <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button> */}
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <UserManagementStats stats={stats} />}

      {/* Filters */}
      <UserManagementFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(true)}
          >
            Bulk Actions
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUsers([])}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Error: {error}
          </p>
        </div>
      )}

      {/* Table */}
      <UserManagementTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        onSelectionChange={handleSelectionChange}
        onUserUpdated={handleUserUpdated}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Dialogs */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={handleUserCreated}
      />

      <BulkActionsDialog
        open={showBulkActions}
        onOpenChange={setShowBulkActions}
        selectedUsers={selectedUsers}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}
