"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { ClientManagementTable } from "@/components/admin/client-management/client-management-table";
import { ClientManagementFilters } from "@/components/admin/client-management/client-management-filters";
import { ClientManagementStats } from "@/components/admin/client-management/client-management-stats";
import { CreateClientDialog } from "@/components/admin/client-management/create-client-dialog";
import { BulkActionsDialog } from "@/components/admin/client-management/bulk-actions-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, Download, Upload, RefreshCw } from "lucide-react";
import { ClientQuery } from "@/lib/services/client-management-service";
import { 
  setSelectedClients, 
  clearSelection,
  setFilters,
  resetFilters,
  setClients,
  setStats,
  setPagination,
  setLoading,
  setError,
  useGetClientsQuery,
  useGetClientStatsQuery
} from "@/lib/features/clients";

export default function ClientsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    clients,
    selectedClients,
    filters,
    stats,
    pagination,
    loading,
    error,
    searchTerm,
    sortBy,
    sortOrder,
  } = useSelector((state: RootState) => state.clients);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

  // Fetch clients data
  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
  } = useGetClientsQuery(filters, {
    skip: false,
  });

  // Fetch client stats
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGetClientStatsQuery();

  // Update Redux state when API data changes
  useEffect(() => {
    if (clientsData?.success && clientsData.data) {
      // Ensure data is an array
      const clientsArray = Array.isArray(clientsData.data) ? clientsData.data : [];
      
      // Convert string status to boolean if needed (temporary fix)
      const processedClients = clientsArray.map((client: any) => ({
        ...client,
        status: typeof client.status === 'string' ? client.status === 'active' : client.status
      }));
      
      dispatch(setClients(processedClients));
      if (clientsData.pagination) {
        dispatch(setPagination(clientsData.pagination));
      }
    }
  }, [clientsData, dispatch]);

  useEffect(() => {
    if (statsData) {
      dispatch(setStats(statsData));
    }
  }, [statsData, dispatch]);

  useEffect(() => {
    dispatch(setLoading(clientsLoading || statsLoading));
  }, [clientsLoading, statsLoading, dispatch]);

  useEffect(() => {
    if (clientsError) {
      dispatch(setError('Failed to fetch clients'));
    }
  }, [clientsError, dispatch]);

  useEffect(() => {
    if (statsError) {
      console.error('Stats error:', statsError);
      dispatch(setError('Failed to fetch client statistics'));
    }
  }, [statsError, dispatch]);

  // Handle search
  const handleSearch = (search: string) => {
    dispatch(setFilters({ search, page: 1 }));
  };

  // Handle sorting
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    dispatch(setFilters({ sortBy, sortOrder, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleLimitChange = (limit: number) => {
    dispatch(setFilters({ limit, page: 1 }));
  };

  // Handle selection
  const handleSelectClient = (clientId: string) => {
    dispatch(setSelectedClients([...selectedClients, clientId]));
  };

  const handleDeselectClient = (clientId: string) => {
    dispatch(setSelectedClients(selectedClients.filter(id => id !== clientId)));
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      dispatch(clearSelection());
    } else {
      dispatch(setSelectedClients(clients.map(client => client._id!)));
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchClients();
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clients');
  };

  // Handle import
  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import clients');
  };

  // Filter clients based on current filters
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(client =>
        client.firstName?.toLowerCase().includes(searchLower) ||
        client.lastName?.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone?.toString().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== undefined) {
      filtered = filtered.filter(client => client.status === filters.status);
    }

    return filtered;
  }, [clients, filters]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col gap-4 px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Client Management</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
           
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  Add Client
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 lg:px-6">
            <ClientManagementStats 
              stats={stats}
              loading={statsLoading}
            />
          </div>

          {/* Filters */}
          <div className="px-4 lg:px-6">
            <ClientManagementFilters
              searchTerm={searchTerm}
              filters={filters}
              onSearch={handleSearch}
              onFiltersChange={(newFilters) => dispatch(setFilters(newFilters))}
              onReset={() => dispatch(resetFilters())}
            />
          </div>

          {/* Table */}
          <div className="px-4 lg:px-6">
            <ClientManagementTable
              clients={filteredClients}
              selectedClients={selectedClients}
              loading={loading}
              error={error}
              pagination={pagination}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSelectClient={handleSelectClient}
              onDeselectClient={handleDeselectClient}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onBulkActions={() => setIsBulkActionsOpen(true)}
              onStatusChange={refetchClients}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateClientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <BulkActionsDialog
        open={isBulkActionsOpen}
        onOpenChange={setIsBulkActionsOpen}
        selectedClients={selectedClients}
        onSuccess={() => {
          dispatch(clearSelection());
          refetchClients();
        }}
      />
    </div>
  );
}