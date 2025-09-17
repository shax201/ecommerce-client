"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  useGetClientLogosQuery,
  useGetClientLogoByIdQuery,
  useCreateClientLogoMutation,
  useUpdateClientLogoMutation,
  useDeleteClientLogoMutation,
  useReorderClientLogosMutation,
  useBulkActivateClientLogosMutation,
  useBulkDeactivateClientLogosMutation,
  useBulkDeleteClientLogosMutation,
} from "@/lib/features/client-logos";
import { ClientLogoFormData, ReorderRequest } from "@/actions/content";
import {
  setLoading,
  setError,
  setLogos,
  addLogo,
  updateLogo,
  removeLogo,
  removeLogos,
  setPagination,
  setFilters,
  selectLogo,
  deselectLogo,
  selectAllLogos,
  clearSelection,
  toggleLogoSelection,
  startInlineEdit,
  updateEditingValue,
  cancelInlineEdit,
  reorderLogos,
  clearData,
  selectClientLogos,
  selectSelectedLogos,
  selectClientLogosPagination,
  selectClientLogosFilters,
  selectClientLogosLoading,
  selectClientLogosError,
  selectClientLogosLastFetch,
  selectEditingField,
  selectEditingValue,
} from "@/lib/features/client-logos";
import type { RootState, AppDispatch } from "@/lib/store";

interface UseClientLogosReduxOptions {
  initialLogos?: any[];
  initialPagination?: any;
  autoFetch?: boolean;
}

export function useClientLogosRedux(options: UseClientLogosReduxOptions = {}) {
  const {
    initialLogos = [],
    initialPagination,
    autoFetch = true,
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const logos = useSelector(selectClientLogos);
  const selectedLogos = useSelector(selectSelectedLogos);
  const pagination = useSelector(selectClientLogosPagination);
  const filters = useSelector(selectClientLogosFilters);
  const loading = useSelector(selectClientLogosLoading);
  const error = useSelector(selectClientLogosError);
  const lastFetch = useSelector(selectClientLogosLastFetch);
  const editingField = useSelector(selectEditingField);
  const editingValue = useSelector(selectEditingValue);

  // API hooks
  const {
    data: logosData,
    isLoading: isLoadingLogos,
    error: logosError,
    refetch: refetchLogos,
  } = useGetClientLogosQuery(filters, {
    skip: !autoFetch,
  });

  // Mutations
  const [createLogo, { isLoading: isCreatingLogo }] = useCreateClientLogoMutation();
  const [updateLogoMutation, { isLoading: isUpdatingLogo }] = useUpdateClientLogoMutation();
  const [deleteLogoMutation, { isLoading: isDeletingLogo }] = useDeleteClientLogoMutation();
  const [reorderLogosMutation, { isLoading: isReorderingLogos }] = useReorderClientLogosMutation();
  const [bulkActivate, { isLoading: isBulkActivating }] = useBulkActivateClientLogosMutation();
  const [bulkDeactivate, { isLoading: isBulkDeactivating }] = useBulkDeactivateClientLogosMutation();
  const [bulkDelete, { isLoading: isBulkDeleting }] = useBulkDeleteClientLogosMutation();

  // Update local state when API data changes
  useEffect(() => {
    if (logosData?.success && logosData.data) {
      dispatch(setLogos(logosData.data));
      if (logosData.pagination) {
        dispatch(setPagination(logosData.pagination));
      }
    }
  }, [logosData, dispatch]);

  // Initialize with provided data
  useEffect(() => {
    if (initialLogos.length > 0 && logos.length === 0) {
      dispatch(setLogos(initialLogos));
      if (initialPagination) {
        dispatch(setPagination(initialPagination));
      }
    }
  }, [initialLogos, initialPagination, logos.length, dispatch]);

  // Set loading state based on API calls
  useEffect(() => {
    dispatch(setLoading(isLoadingLogos || isCreatingLogo || isUpdatingLogo || isDeletingLogo || isReorderingLogos || isBulkActivating || isBulkDeactivating || isBulkDeleting));
  }, [
    isLoadingLogos,
    isCreatingLogo,
    isUpdatingLogo,
    isDeletingLogo,
    isReorderingLogos,
    isBulkActivating,
    isBulkDeactivating,
    isBulkDeleting,
    dispatch,
  ]);

  // Set error state
  useEffect(() => {
    if (logosError) {
      dispatch(setError(logosError.toString()));
    }
  }, [logosError, dispatch]);

  // Actions
  const loadLogos = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await refetchLogos();
    } catch (error) {
      dispatch(setError("Failed to load client logos"));
      toast.error("Failed to load client logos");
    } finally {
      dispatch(setLoading(false));
    }
  }, [refetchLogos, dispatch]);

  const createLogoAction = useCallback(async (logoData: ClientLogoFormData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await createLogo(logoData).unwrap();
      
      if (result.success) {
        dispatch(addLogo(result.data));
        toast.success("Client logo created successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to create client logo");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create client logo";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [createLogo, dispatch]);

  const updateLogoAction = useCallback(async (logoId: string, logoData: Partial<ClientLogoFormData>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await updateLogoMutation({ logoId, data: logoData }).unwrap();
      
      if (result.success) {
        dispatch(updateLogo(result.data));
        toast.success("Client logo updated successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to update client logo");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update client logo";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [updateLogoMutation, dispatch]);

  const deleteLogoAction = useCallback(async (logoId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await deleteLogoMutation(logoId).unwrap();
      
      if (result.success) {
        dispatch(removeLogo(logoId));
        toast.success("Client logo deleted successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to delete client logo");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete client logo";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [deleteLogoMutation, dispatch]);

  const reorderLogosAction = useCallback(async (updates: ReorderRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await reorderLogosMutation(updates).unwrap();
      
      if (result.success) {
        // Update local state with new order
        const updatedLogos = [...logos];
        updates.updates.forEach(({ id, order }) => {
          const logo = updatedLogos.find(l => l._id === id);
          if (logo) {
            logo.order = order;
          }
        });
        updatedLogos.sort((a, b) => a.order - b.order);
        dispatch(reorderLogos(updatedLogos));
        toast.success("Client logos reordered successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to reorder client logos");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to reorder client logos";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [reorderLogosMutation, logos, dispatch]);

  const bulkActivateAction = useCallback(async (logoIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await bulkActivate(logoIds).unwrap();
      
      if (result.success) {
        // Update local state
        logoIds.forEach(logoId => {
          const logo = logos.find(l => l._id === logoId);
          if (logo) {
            dispatch(updateLogo({ ...logo, isActive: true }));
          }
        });
        toast.success(result.message);
        return result;
      } else {
        throw new Error(result.message || "Failed to activate client logos");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to activate client logos";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [bulkActivate, logos, dispatch]);

  const bulkDeactivateAction = useCallback(async (logoIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await bulkDeactivate(logoIds).unwrap();
      
      if (result.success) {
        // Update local state
        logoIds.forEach(logoId => {
          const logo = logos.find(l => l._id === logoId);
          if (logo) {
            dispatch(updateLogo({ ...logo, isActive: false }));
          }
        });
        toast.success(result.message);
        return result;
      } else {
        throw new Error(result.message || "Failed to deactivate client logos");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to deactivate client logos";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [bulkDeactivate, logos, dispatch]);

  const bulkDeleteAction = useCallback(async (logoIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await bulkDelete(logoIds).unwrap();
      
      if (result.success) {
        dispatch(removeLogos(logoIds));
        toast.success(result.message);
        return result;
      } else {
        throw new Error(result.message || "Failed to delete client logos");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to delete client logos";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [bulkDelete, dispatch]);

  // Selection actions
  const selectLogoAction = useCallback((logoId: string) => {
    dispatch(selectLogo(logoId));
  }, [dispatch]);

  const deselectLogoAction = useCallback((logoId: string) => {
    dispatch(deselectLogo(logoId));
  }, [dispatch]);

  const selectAllLogosAction = useCallback(() => {
    dispatch(selectAllLogos());
  }, [dispatch]);

  const clearSelectionAction = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const toggleLogoSelectionAction = useCallback((logoId: string) => {
    dispatch(toggleLogoSelection(logoId));
  }, [dispatch]);

  // Inline editing actions
  const startInlineEditAction = useCallback((id: string, field: string, value: string) => {
    dispatch(startInlineEdit({ id, field, value }));
  }, [dispatch]);

  const updateEditingValueAction = useCallback((value: string) => {
    dispatch(updateEditingValue(value));
  }, [dispatch]);

  const cancelInlineEditAction = useCallback(() => {
    dispatch(cancelInlineEdit());
  }, [dispatch]);

  const saveInlineEditAction = useCallback(async () => {
    if (!editingField) return;

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const result = await updateLogoMutation({ 
        logoId: editingField.id, 
        data: { [editingField.field]: editingValue } 
      }).unwrap();
      
      if (result.success) {
        dispatch(updateLogo(result.data));
        dispatch(cancelInlineEdit());
        toast.success("Updated successfully");
        return result;
      } else {
        throw new Error(result.message || "Failed to update");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to update";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [updateLogoMutation, editingField, editingValue, dispatch]);

  const setFiltersAction = useCallback((newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch, filters]);

  const clearDataAction = useCallback(() => {
    dispatch(clearData());
  }, [dispatch]);

  const refreshAction = useCallback(async () => {
    await loadLogos();
  }, [loadLogos]);

  return {
    // State
    logos,
    selectedLogos,
    pagination,
    filters,
    loading,
    error,
    lastFetch,
    editingField,
    editingValue,
    
    // Actions
    loadLogos: loadLogos,
    createLogo: createLogoAction,
    updateLogo: updateLogoAction,
    deleteLogo: deleteLogoAction,
    reorderLogos: reorderLogosAction,
    bulkActivate: bulkActivateAction,
    bulkDeactivate: bulkDeactivateAction,
    bulkDelete: bulkDeleteAction,
    selectLogo: selectLogoAction,
    deselectLogo: deselectLogoAction,
    selectAllLogos: selectAllLogosAction,
    clearSelection: clearSelectionAction,
    toggleLogoSelection: toggleLogoSelectionAction,
    startInlineEdit: startInlineEditAction,
    updateEditingValue: updateEditingValueAction,
    cancelInlineEdit: cancelInlineEditAction,
    saveInlineEdit: saveInlineEditAction,
    setFilters: setFiltersAction,
    clearData: clearDataAction,
    refresh: refreshAction,
    
    // Computed values
    dataSource: "redux",
    performanceMetrics: {
      lastFetch,
      cacheHit: lastFetch ? Date.now() - lastFetch < 60000 : false,
    },
  };
}
